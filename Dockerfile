FROM node:16.17.0-alpine

RUN apk add --no-cache sqlite

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=80

EXPOSE 80

CMD ["npm", "run", "start"]
