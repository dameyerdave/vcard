.DEFAULT_GOAL := help

COMPOSE ?= docker compose
COMPOSE_FILE ?= docker-compose.yml
COMPOSE_CMD := $(COMPOSE) -f $(COMPOSE_FILE)

APP_SERVICE := enbizcard
PROXY_SERVICE := envoy
TUNNEL_SERVICE := cloudflared
DEV_SERVICES := $(APP_SERVICE) $(PROXY_SERVICE)
PROD_SERVICES := $(APP_SERVICE) $(PROXY_SERVICE) $(TUNNEL_SERVICE)

.PHONY: help env up down stop start restart build rebuild pull ps logs logs-app logs-proxy logs-tunnel shell config clean dev-up dev-down dev-restart prod-up prod-down prod-restart

help: ## Show available targets
	@awk 'BEGIN {FS = ":.*## "; printf "\nUsage: make <target>\n\nTargets:\n"} /^[a-zA-Z0-9_-]+:.*## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

env: ## Create .env from env.example if it does not exist yet
	@test -f .env || cp env.example .env
	@echo ".env is ready"

up: dev-up ## Start the local development stack

dev-up: ## Build and start the local stack (app + envoy)
	-@$(COMPOSE_CMD) rm -f -s $(TUNNEL_SERVICE)
	@$(COMPOSE_CMD) up -d --build $(DEV_SERVICES)

prod-up: ## Build and start the full production stack (requires a valid Cloudflare token)
	@$(COMPOSE_CMD) up -d --build $(PROD_SERVICES)

down: ## Stop and remove the full stack
	@$(COMPOSE_CMD) down --remove-orphans

dev-down: down ## Stop the local development stack

prod-down: down ## Stop the production stack

stop: ## Stop all running services without removing containers
	@$(COMPOSE_CMD) stop

start: ## Start previously created containers
	@$(COMPOSE_CMD) start

restart: ## Restart all services
	@$(COMPOSE_CMD) restart

dev-restart: ## Recreate the local development stack
	@$(MAKE) dev-down
	@$(MAKE) dev-up

prod-restart: ## Recreate the production stack
	@$(MAKE) prod-down
	@$(MAKE) prod-up

build: ## Build the application image
	@$(COMPOSE_CMD) build $(APP_SERVICE)

rebuild: ## Rebuild the application image without cache
	@$(COMPOSE_CMD) build --no-cache $(APP_SERVICE)

pull: ## Pull the latest external images
	@$(COMPOSE_CMD) pull $(PROXY_SERVICE) $(TUNNEL_SERVICE)

ps: ## Show container status
	@$(COMPOSE_CMD) ps

logs: ## Stream logs for all services
	@$(COMPOSE_CMD) logs -f --tail=100

logs-app: ## Stream app logs
	@$(COMPOSE_CMD) logs -f --tail=100 $(APP_SERVICE)

logs-proxy: ## Stream Envoy logs
	@$(COMPOSE_CMD) logs -f --tail=100 $(PROXY_SERVICE)

logs-tunnel: ## Stream Cloudflared logs
	@$(COMPOSE_CMD) logs -f --tail=100 $(TUNNEL_SERVICE)

shell: ## Open a shell in the app container
	@$(COMPOSE_CMD) exec $(APP_SERVICE) sh

config: ## Render the resolved Compose configuration
	@$(COMPOSE_CMD) config

clean: ## Remove containers, networks, and anonymous volumes
	@$(COMPOSE_CMD) down --volumes --remove-orphans
