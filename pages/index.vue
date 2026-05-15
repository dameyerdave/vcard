<template>
  <div
    ref="container"
    class="container relative bg-gray-900 mx-auto text-gray-100"
    style="max-width: 960px"
  >
    <Modal
      v-if="content"
      @click.native.self="clearContent"
      :content="content"
      :clearContent="clearContent"
    />
    <transition name="drop">
      <div
        v-if="inView || showPreview"
        class="
          fixed
          top-0
          w-full
          z-30
          bg-gray-900
          justify-between
          items-center
          flex
          md:hidden
        "
      >
        <div
          class="logo w-16 m-4"
          v-html="require(`~/assets/icons/logo.svg?include`)"
        ></div>
        <button
          class="
            p-3
            mx-4
            font-extrabold
            rounded
            tracking-wide
            focus:outline-none
            select-none
          "
          :class="showPreview ? 'bg-gray-700' : 'bg-emerald-600'"
          @click="!opening && togglePreview()"
        >
          {{ showPreview ? 'Close preview' : 'Open preview' }}
        </button>
      </div>
    </transition>
    <transition name="fade">
      <Preview
        v-show="showPreview"
        class="fixed top-20 w-full bottom-0 z-20 border-none rounded-b-none"
        ref="html"
        :username="username"
        :genInfo="genInfo"
        :images="images"
        :featured="featured"
        :colors="colors"
        :primaryActions="primaryActions"
        :secondaryActions="secondaryActions"
        :PreviewMode="PreviewMode"
        :downloadVcard="downloadVcard"
        :footerCredit="footerCredit"
        :showAlert="showAlert"
        :hasLightBG="hasLightBG"
        :shareEnabled="Boolean(hostedURL)"
        :shareUrl="hostedURL"
        :hostedView="true"
      />
    </transition>

    <div class="px-4">
      <div class="flex items-start justify-between pt-8">
        <div
          class="logo w-24"
          v-html="require(`~/assets/icons/logo.svg?include`)"
          title="Xuno vCard Generator"
        ></div>
        <div
          class="
            text-right
            shrink-0
            p-3
            border-2
            text-white
            border-gray-700
            rounded
          "
        >
          <p class="text-xs uppercase tracking-widest text-gray-400">
            Signed in as
          </p>
          <p class="mt-1 font-extrabold break-all">
            {{ authUser ? authUser.email : 'Not signed in' }}
          </p>
          <a
            v-if="authUser"
            href="/cdn-cgi/access/logout"
            class="mt-2 inline-block text-xs font-extrabold uppercase tracking-widest text-gray-400 transition-colors duration-200 hover:text-white focus:text-white"
          >
            Logout
          </a>
        </div>
      </div>
    </div>
    <div class="px-4 mt-10">
      <Download
        mode="cards"
        :publishCard="publishCard"
        :publishBusy="publishBusy"
        :publishLabel="publishLabel"
        :authUser="authUser"
        :userCards="userCards"
        :cardsLoading="cardsLoading"
        :copyCardLink="copyCardLink"
        :loadCard="loadCard"
        :deleteCard="deleteCard"
      />
    </div>
    <div class="md:grid md:grid-cols-2">
      <div class="px-4 mt-12">
        <div ref="create" id="step-1" class="pt-8">
          <h2 class="font-extrabold text-2xl">Header attachments</h2>
          <div class="stepC">
            <Attachment
              :content="images"
              type="logo"
              :resizeImage="resizeImage"
              label="Add logo"
              description="suggested format: svg, png or gif"
              :showAlert="showAlert"
            />
            <Attachment
              :content="images"
              type="cover"
              :resizeImage="resizeImage"
              label="Add cover photo"
              description="suggested format: svg, jpeg, png or gif"
              :showAlert="showAlert"
            />
            <p class="mt-6 border p-4 rounded border-gray-700 text-gray-400">
              Recommended cover photo size is 960 x 640 pixels, with an aspect
              ratio of 3:2
            </p>
          </div>
        </div>
        <div id="step-2" class="mt-16">
          <h2 class="font-extrabold text-2xl">Contact information</h2>
          <Attachment
            :content="images"
            type="photo"
            :resizeImage="resizeImage"
            label="Add profile photo"
            description="suggested format: jpeg, png or gif"
            :showAlert="showAlert"
          />
          <p class="mt-6 border p-4 rounded border-gray-700 text-gray-400">
            Recommended profile photo size is 320 x 320 pixels, with an aspect
            ratio of 1:1
          </p>
          <div class="stepC mt-6 grid grid-cols-2 gap-4">
            <div>
              <label for="firstname" class="ml-4">First name</label>
              <input
                id="firstname"
                spellcheck="false"
                type="text"
                v-model="genInfo.fname"
                autocapitalize="words"
                class="
                  mt-2
                  px-4
                  w-full
                  h-12
                  bg-black
                  rounded
                  border border-transparent
                  transition-colors
                  duration-200
                  focus:outline-none focus:border-gray-600
                  hover:border-gray-600
                "
              />
            </div>
            <div>
              <label for="lastname" class="ml-4">Last name</label>
              <input
                id="lastname"
                spellcheck="false"
                type="text"
                v-model="genInfo.lname"
                autocapitalize="words"
                class="
                  mt-2
                  px-4
                  w-full
                  h-12
                  bg-black
                  rounded
                  border border-transparent
                  transition-colors
                  duration-200
                  focus:outline-none focus:border-gray-600
                  hover:border-gray-600
                "
              />
            </div>
          </div>
          <div class="stepC mt-6">
            <label for="pronouns" class="ml-4">Gender pronouns</label>
            <input
              id="pronouns"
              spellcheck="false"
              type="text"
              v-model="genInfo.pronouns"
              placeholder="He/Him/His"
              autocapitalize="words"
              class="
                mt-2
                px-4
                w-full
                h-12
                bg-black
                placeholder-gray-600
                rounded
                border border-transparent
                transition-colors
                duration-200
                focus:outline-none focus:border-gray-600
                hover:border-gray-600
              "
            />
          </div>
          <div class="stepC mt-6">
            <label for="job-title" class="ml-4">Job title</label>
            <input
              id="job-title"
              type="text"
              spellcheck="true"
              autocapitalize="words"
              v-model="genInfo.title"
              class="
                mt-2
                px-4
                w-full
                h-12
                bg-black
                rounded
                border border-transparent
                transition-colors
                duration-200
                focus:outline-none focus:border-gray-600
                hover:border-gray-600
              "
            />
          </div>
          <div class="stepC mt-6">
            <label for="business-name" class="ml-4">Business name</label>
            <input
              id="business-name"
              spellcheck="false"
              type="text"
              v-model="genInfo.biz"
              autocapitalize="words"
              class="
                mt-2
                px-4
                w-full
                h-12
                bg-black
                rounded
                border border-transparent
                transition-colors
                duration-200
                focus:outline-none focus:border-gray-600
                hover:border-gray-600
              "
            />
          </div>
          <div class="stepC mt-6">
            <p class="ml-4">Business address</p>
            <div class="mt-2 grid grid-cols-3 gap-4">
              <div class="col-span-2">
                <label for="business-street" class="sr-only">Street</label>
                <input
                  id="business-street"
                  spellcheck="false"
                  type="text"
                  v-model="genInfo.street"
                  placeholder="Street"
                  autocapitalize="words"
                  class="
                    px-4
                    w-full
                    h-12
                    bg-black
                    placeholder-gray-600
                    rounded
                    border border-transparent
                    transition-colors
                    duration-200
                    focus:outline-none focus:border-gray-600
                    hover:border-gray-600
                  "
                />
              </div>
              <div>
                <label for="business-street-no" class="sr-only">Number</label>
                <input
                  id="business-street-no"
                  spellcheck="false"
                  type="text"
                  v-model="genInfo.streetNo"
                  placeholder="No."
                  class="
                    px-4
                    w-full
                    h-12
                    bg-black
                    placeholder-gray-600
                    rounded
                    border border-transparent
                    transition-colors
                    duration-200
                    focus:outline-none focus:border-gray-600
                    hover:border-gray-600
                  "
                />
              </div>
              <div>
                <label for="business-zip" class="sr-only">ZIP</label>
                <input
                  id="business-zip"
                  spellcheck="false"
                  type="text"
                  v-model="genInfo.zip"
                  placeholder="ZIP"
                  class="
                    px-4
                    w-full
                    h-12
                    bg-black
                    placeholder-gray-600
                    rounded
                    border border-transparent
                    transition-colors
                    duration-200
                    focus:outline-none focus:border-gray-600
                    hover:border-gray-600
                  "
                />
              </div>
              <div class="col-span-2">
                <label for="business-city" class="sr-only">City</label>
                <input
                  id="business-city"
                  spellcheck="false"
                  type="text"
                  v-model="genInfo.city"
                  placeholder="City"
                  autocapitalize="words"
                  class="
                    px-4
                    w-full
                    h-12
                    bg-black
                    placeholder-gray-600
                    rounded
                    border border-transparent
                    transition-colors
                    duration-200
                    focus:outline-none focus:border-gray-600
                    hover:border-gray-600
                  "
                />
              </div>
              <div class="col-span-3">
                <label for="business-country" class="sr-only">Country</label>
                <input
                  id="business-country"
                  spellcheck="false"
                  type="text"
                  v-model="genInfo.country"
                  placeholder="Country"
                  autocapitalize="words"
                  class="
                    px-4
                    w-full
                    h-12
                    bg-black
                    placeholder-gray-600
                    rounded
                    border border-transparent
                    transition-colors
                    duration-200
                    focus:outline-none focus:border-gray-600
                    hover:border-gray-600
                  "
                />
              </div>
            </div>
          </div>
        </div>
        <div id="step-3" class="mt-16">
          <h2 class="font-extrabold text-2xl">Primary actions</h2>
          <draggable
            v-model="primaryActions"
            handle=".drag"
            animation="1"
            ghostClass="ghost"
          >
            <transition-group type="transition" name="list">
              <Action
                v-for="(item, index) in primaryActions"
                :key="'item' + index"
                name="primaryActions"
                :type="primaryActions"
                :item="item"
                :index="index"
                :buttonBg="colors.buttonBg.color"
                :removeAction="removeAction"
              />
            </transition-group>
          </draggable>
          <div
            class="mt-6 border-gray-800"
            :class="{ 'border-t pt-6': primaryActions.length }"
          >
            <input
              spellcheck="false"
              type="text"
              v-model="filterPrimary"
              placeholder="Search an action"
              class="
                px-4
                mb-2
                w-full
                h-12
                bg-black
                placeholder-gray-600
                rounded
                border border-transparent
                transition-colors
                duration-200
                focus:outline-none focus:border-gray-600
                hover:border-gray-600
              "
              @keydown.esc="clearFilterActions"
              @keypress.enter="
                filteredAction('filteredPrimaryActions', 'primaryActions')
              "
            />
            <p class="p-3" v-if="filteredPrimaryActions.length < 1">
              Can't find an action? Please
              <a
                href="#help"
                class="
                  cursor-pointer
                  underline
                  font-extrabold
                  text-emerald-600
                  hover:text-emerald-500
                  focus:text-emerald-500
                  transition-colors
                  duration-200
                "
                >leave your suggestion</a
              >
              on Telegram
            </p>
            <div class="stepC actions">
              <button
                v-for="(action, index) in filteredPrimaryActions"
                :key="index"
                @click="addAction('primaryActions', action.name)"
                class="
                  p-3
                  flex
                  items-center
                  shrink-0
                  rounded
                  hover:bg-gray-600
                  focus:bg-gray-600
                  transition-colors
                  duration-200
                  focus:outline-none
                  bg-gray-700
                "
                :title="
                  action.name.substr(0, 1).toUpperCase() + action.name.slice(1)
                "
                :aria-label="action.name"
              >
                <div
                  class="w-6 h-6 mr-3 shrink-0"
                  v-html="require(`~/assets/icons/${action.icon}.svg?include`)"
                ></div>
                <p class="whitespace-nowrap">
                  {{
                    action.name.substr(0, 1).toUpperCase() +
                    action.name.slice(1)
                  }}
                </p>
              </button>
            </div>
          </div>
        </div>
        <div id="step-4" class="mt-16">
          <h2 class="font-extrabold text-2xl">Secondary actions</h2>
          <draggable
            v-model="secondaryActions"
            handle=".drag"
            animation="1"
            ghostClass="ghost"
          >
            <transition-group type="transition" name="list">
              <Action
                v-for="(item, index) in secondaryActions"
                :key="'item' + index"
                name="secondaryActions"
                :type="secondaryActions"
                :item="item"
                :index="index"
                :removeAction="removeAction"
              /> </transition-group
          ></draggable>
          <div
            class="mt-6 border-gray-800"
            :class="{ 'border-t pt-6': secondaryActions.length }"
          >
            <input
              spellcheck="false"
              type="text"
              v-model="filterSecondary"
              placeholder="Search an action"
              class="
                px-4
                mb-2
                w-full
                h-12
                bg-black
                placeholder-gray-600
                rounded
                border border-transparent
                transition-colors
                duration-200
                focus:outline-none focus:border-gray-600
                hover:border-gray-600
              "
              @keydown.esc="clearFilterActions"
              @keypress.enter="
                filteredAction('filteredSecondaryActions', 'secondaryActions')
              "
            />
            <p class="p-3" v-if="filteredSecondaryActions.length < 1">
              Can't find an action? Please
              <a
                href="#help"
                class="
                  cursor-pointer
                  underline
                  font-extrabold
                  text-emerald-600
                  hover:text-emerald-500
                  focus:text-emerald-500
                  transition-colors
                  duration-200
                "
                >leave your suggestion</a
              >
              on Telegram
            </p>
            <div class="stepC actions">
              <button
                v-for="(action, index) in filteredSecondaryActions"
                :key="index"
                @click="addAction('secondaryActions', action.name)"
                class="
                  p-3
                  flex
                  items-center
                  shrink-0
                  rounded
                  hover:brightness-125
                  focus:brightness-125
                  transition-all
                  duration-200
                  focus:outline-none
                "
                :style="{ background: action.color }"
                :title="
                  action.name.substr(0, 1).toUpperCase() + action.name.slice(1)
                "
              >
                <div
                  class="w-6 h-6 mr-3 shrink-0"
                  v-html="require(`~/assets/icons/${action.icon}.svg?include`)"
                ></div>
                <p
                  class="whitespace-nowrap"
                  :class="{ 'text-gray-900': action.light }"
                >
                  {{
                    action.name.substr(0, 1).toUpperCase() +
                    action.name.slice(1)
                  }}
                </p>
              </button>
            </div>
          </div>
          <!-- class="stepC actions mt-6 border-gray-800"
            :class="{ 'border-t pt-6': secondaryActions.length }" -->
        </div>
        <div id="step-5" class="mt-16">
          <h2 class="font-extrabold text-2xl">Featured content</h2>
          <div class="stepC">
            <draggable
              v-model="featured"
              handle=".drag"
              animation="1"
              ghostClass="ghost"
            >
              <transition-group type="transition" name="list">
                <Featured
                  v-for="(content, index) in featured"
                  :key="'content' + index"
                  :featured="featured"
                  :resizeImage="resizeImage"
                  :index="index"
                  mimetypes="image/jpeg, image/png, audio/mpeg, video/mp4, video/webm, application/pdf"
                  :showAlert="showAlert"
                /> </transition-group
            ></draggable>

            <div class="flex mt-6">
              <div class="flex flex-wrap items-center">
                <button
                  class="
                    p-3
                    rounded
                    bg-gray-700
                    hover:bg-gray-600
                    focus:bg-gray-600
                    transition-colors
                    duration-200
                    focus:outline-none
                  "
                  @click="addFeature()"
                  aria-label="Add section"
                >
                  <div
                    class="w-6 h-6"
                    v-html="require(`~/assets/icons/add.svg?include`)"
                  ></div>
                </button>
                <p class="ml-3 leading-none">Add section</p>
              </div>
            </div>
            <p class="mt-6 border p-4 rounded border-gray-700 text-gray-400">
              Supported media formats: jpeg, png, mp3, mp4, webm and pdf
            </p>
          </div>
        </div>
        <div id="step-7" class="mt-16">
          <h2 class="font-extrabold text-2xl">Themes</h2>
          <div class="stepC mt-3 flex flex-wrap">
            <button
              @click="changeTheme(1)"
              class="
                w-12
                h-12
                rounded
                mt-3
                mr-3
                font-extrabold
                focus:outline-none
                transition-colors
                duration-200
              "
              :class="
                theme == 1
                  ? 'bg-emerald-600'
                  : 'bg-gray-700 hover:bg-gray-600 focus:bg-gray-600'
              "
            >
              A
            </button>
            <button
              @click="changeTheme(2)"
              class="
                w-12
                h-12
                rounded
                mt-3
                mr-3
                font-extrabold
                focus:outline-none
                transition-colors
                duration-200
              "
              :class="
                theme == 2
                  ? 'bg-emerald-600'
                  : 'bg-gray-700 hover:bg-gray-600 focus:bg-gray-600'
              "
            >
              B
            </button>
            <button
              @click="changeTheme(3)"
              class="
                w-12
                h-12
                rounded
                mt-3
                mr-3
                font-extrabold
                focus:outline-none
                transition-colors
                duration-200
              "
              :class="
                theme == 3
                  ? 'bg-emerald-600'
                  : 'bg-gray-700 hover:bg-gray-600 focus:bg-gray-600'
              "
            >
              C
            </button>
          </div>
        </div>
        <div id="step-8" class="mt-16">
          <h2 class="font-extrabold text-2xl">Colours</h2>
          <div class="stepC">
            <Colour name="logoBg" label="Header background" :colors="colors" />
            <Colour name="mainBg" label="Main background" :colors="colors" />
            <Colour
              name="buttonBg"
              label="Button background"
              :colors="colors"
            />
            <Colour
              name="cardBg"
              label="Featured content background"
              :colors="colors"
            />
          </div>
        </div>
        <div id="step-9" class="mt-16">
          <h2 class="font-extrabold text-2xl">Fonts</h2>
          <div class="stepC mt-6">
            <label for="font-link" class="ml-4">Web font embed code</label>
            <textarea
              id="font-link"
              v-model="genInfo.fontLink"
              class="
                block
                mt-2
                px-4
                py-3
                w-full
                bg-black
                placeholder-gray-600
                rounded
                border border-transparent
                transition-colors
                duration-200
                focus:outline-none focus:border-gray-600
                resize-none
                hover:border-gray-600
              "
              rows="4"
              spellcheck="false"
              :placeholder="`<link href=&quot;https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap&quot; rel=&quot;stylesheet&quot;>`"
            ></textarea>
          </div>
          <div class="stepC mt-6">
            <label for="font-css" class="ml-4">Web font CSS rule</label>
            <input
              spellcheck="false"
              type="text"
              id="font-css"
              v-model="genInfo.fontCss"
              class="
                block
                mt-2
                px-4
                py-3
                w-full
                bg-black
                placeholder-gray-600
                rounded
                border border-transparent
                transition-colors
                duration-200
                focus:outline-none focus:border-gray-600
                resize-none
                hover:border-gray-600
              "
              :placeholder="`font-family: 'Poppins', sans-serif;`"
            />
          </div>
          <p class="mt-6 border p-4 rounded border-gray-700 text-gray-400">
            Supports services such as Google Fonts, Adobe Typekit, etc. Make
            sure to get the embed code for both regular and bold font variants
            from the same font family.
          </p>
        </div>
        <Download
          mode="publish"
          :publishCard="publishCard"
          :publishBusy="publishBusy"
          :publishLabel="publishLabel"
          :authUser="authUser"
          :userCards="userCards"
          :cardsLoading="cardsLoading"
          :copyCardLink="copyCardLink"
          :loadCard="loadCard"
          :deleteCard="deleteCard"
        />
      </div>
      <div
        id="preview-container"
        class="relative w-full mt-20 sm:mt-0 hidden md:block"
      >
        <div
          id="preview"
          class="
            flex flex-col
            items-center
            justify-center
            sm:sticky sm:top-0
            md:mx-6
            lg:mx-12
          "
        >
          <div id="device" class="sm:mt-10">
            <h2 class="text-center py-4 font-extrabold text-gray-200">
              LIVE PREVIEW
            </h2>
            <Preview
              ref="html"
              :username="username"
              :genInfo="genInfo"
              :images="images"
              :featured="featured"
              :colors="colors"
              :primaryActions="primaryActions"
              :secondaryActions="secondaryActions"
              :PreviewMode="PreviewMode"
              :downloadVcard="downloadVcard"
              :footerCredit="footerCredit"
              :showAlert="showAlert"
              :hasLightBG="hasLightBG"
              :shareEnabled="Boolean(hostedURL)"
              :shareUrl="hostedURL"
              :hostedView="true"
            />
          </div>
        </div>
      </div>
    </div>
    <Vcard ref="vCard" :vCard="vCard" />
  </div>
</template>

<script>
import Modal from '@/components/Modal'
import Attachment from '@/components/Attachment'
import Action from '@/components/Action'
import Featured from '@/components/Featured'
import Colour from '@/components/Colour'
import Preview from '@/components/Preview'
import Download from '@/components/Download'
import Cropper from '@/components/Cropper'

import Vcard from '@/components/Vcard'
import draggable from 'vuedraggable'

import { saveAs } from 'file-saver'
import { mapState, mapActions } from 'vuex'
const { normalizeGenInfoAddress } = require('../utils/address')

export default {
  components: {
    Cropper,
    Modal,
    Attachment,
    Action,
    Featured,
    Colour,
    Preview,
    Download,
    Vcard,
    draggable,
  },

  data() {
    return {
      downloadCheckList: [],
      images: {
        logo: {
          url: null,
          blob: null,
          ext: null,
          mime: null,
          resized: null,
        },
        photo: {
          url: null,
          blob: null,
          ext: null,
          mime: null,
          resized: null,
        },
        cover: {
          url: null,
          blob: null,
          ext: null,
          mime: null,
          resized: null,
        },
      },
      colors: {
        logoBg: {
          color: `#000000`,
          openPalette: false,
        },
        mainBg: {
          color: `#ddd`,
          openPalette: false,
        },
        buttonBg: {
          color: `#7dd3fc`,
          openPalette: false,
        },
        cardBg: {
          color: `#fff`,
          openPalette: false,
        },
      },
      genInfo: {
        fname: null,
        lname: null,
        pronouns: null,
        title: null,
        biz: null,
        addr: null,
        street: null,
        streetNo: null,
        city: null,
        zip: null,
        country: null,
        desc: null,
        key: null,
        tracker: null,
        fontLink: null,
        fontCss: null,
      },
      primaryActions: [],
      filterPrimary: '',
      secondaryActions: [],
      filterSecondary: '',
      actions: {
        primaryActions: [
          {
            name: 'Mobile',
            icon: 'call',
            href: 'tel:',
            placeholder: '+XX XXXXX XXXXX',
            value: null,
            label: 'Mobile number',
            order: 0,
            isURL: 0,
          },
          {
            name: 'Office',
            icon: 'call',
            href: 'tel:',
            placeholder: '+XX XXXXX XXXXX',
            value: null,
            label: 'Office number',
            order: 1,
            isURL: 0,
          },
          {
            name: 'Home',
            icon: 'call',
            href: 'tel:',
            placeholder: '+XX XXXXX XXXXX',
            value: null,
            label: 'Home number',
            order: 2,
            isURL: 0,
          },
          {
            name: 'SMS',
            icon: 'sms',
            href: 'sms:',
            placeholder: '+XX XXXXX XXXXX',
            value: null,
            label: 'SMS mobile number',
            order: 3,
            isURL: 0,
          },
          {
            name: 'Email',
            icon: 'email',
            href: 'mailto:',
            placeholder: 'info@example.com',
            value: null,
            label: 'Email address',
            order: 4,
          },
          {
            name: 'Website',
            icon: 'website',
            placeholder: 'https://example.com',
            value: null,
            label: 'Website URL',
            order: 5,
            isURL: 1,
          },
          {
            name: 'Store',
            icon: 'store',
            placeholder: 'https://example.com/storeID',
            value: null,
            label: 'Online Store URL',
            order: 6,
            isURL: 1,
          },
          {
            name: 'Location',
            icon: 'location',
            placeholder: 'https://osm.org/go/location',
            value: null,
            label: 'Map location URL',
            order: 7,
            isURL: 1,
          },

          {
            name: 'Signal',
            icon: 'signal',
            href: 'https://signal.me/#p/',
            placeholder: '+XXXXXXXXXXXX',
            value: null,
            label: 'Signal number with country code (no spaces)',
            order: 8,
            isURL: 1,
          },
          {
            name: 'Telegram',
            icon: 'telegram',
            href: 'https://t.me/',
            placeholder: 'username',
            value: null,
            label: 'Telegram username',
            order: 9,
            isURL: 1,
          },
          {
            name: 'Matrix',
            icon: 'matrix',
            href: 'https://matrix.to/#/',
            placeholder: '@username:matrix.org',
            value: null,
            label: 'Matrix userID',
            order: 10,
            isURL: 1,
          },
          {
            name: 'WhatsApp',
            icon: 'whatsapp',
            placeholder: 'https://wa.me/profileID',
            value: null,
            label: 'WhatsApp profile URL',
            order: 11,
            isURL: 1,
          },
          {
            name: 'Messenger',
            icon: 'messenger',
            href: 'https://m.me/',
            placeholder: 'username',
            value: null,
            label: 'Messenger username',
            order: 12,
            isURL: 1,
          },
          {
            name: 'Skype',
            icon: 'skype',
            href: 'skype:',
            hrefEnd: '?chat',
            placeholder: 'username',
            value: null,
            label: 'Skype username',
            order: 13,
            isURL: 1,
          },
          {
            name: 'Line',
            icon: 'line',
            href: 'https://line.me/ti/p/',
            placeholder: 'LINE ID',
            value: null,
            label: 'Line profile ID',
            order: 14,
            isURL: 1,
          },
          {
            name: 'Viber',
            icon: 'viber',
            href: 'viber://chat?number=',
            placeholder: 'XX XXXXX XXXXX',
            value: null,
            label: 'Viber mobile number',
            order: 15,
            isURL: 1,
          },
          {
            name: 'WeChat',
            icon: 'wechat',
            href: 'weixin://dl/chat?',
            placeholder: 'WeChat ID',
            value: null,
            label: 'WeChat profile ID',
            order: 16,
            isURL: 1,
          },
          {
            name: 'Calendar',
            icon: 'calendar',
            placeholder: 'https://example.com/calendarID',
            value: null,
            label: 'Calendar URL',
            order: 17,
            isURL: 1,
          },
          {
            name: 'XMPP',
            icon: 'xmpp',
            href: 'xmpp:',
            placeholder: 'XMPP ID',
            value: null,
            label: 'XMPP ID',
            order: 18,
            isURL: 1,
          },
          // {
          //   name: 'IRC',
          //   icon: 'irc',
          //   href: 'irc:',
          //   placeholder: 'IRC ID',
          //   value: null,
          //   label: 'IRC ID',
          //   order: 19,
          //   isURL: 1,
          // },
        ],
        secondaryActions: [
          // todo: Fix Instagram gradient icon preview
          {
            name: 'Instagram',
            icon: 'instagram',
            href: 'https://instagram.com/',
            placeholder: 'username',
            value: null,
            color: '#ffffff',
            light: 1,
            gradientIcon: 1,
            label: 'Instagram username',
          },
          {
            name: 'Threads',
            icon: 'threads',
            href: 'https://www.threads.net/',
            placeholder: '@username',
            value: null,
            color: '#000000',
            label: 'Threads username',
          },
          {
            name: 'Pixelfed',
            icon: 'pixelfed',
            placeholder: 'https://pixelfed.social/username',
            value: null,
            color: '#8d59a8',
            label: 'Pixelfed profile URL',
          },
          {
            name: 'Facebook',
            icon: 'facebook',
            href: 'https://facebook.com/',
            placeholder: 'username or pagename',
            value: null,
            color: '#1877f2',
            label: 'Facebook username or pagename',
          },
          {
            name: 'Diaspora',
            icon: 'diaspora',
            placeholder: 'https://diaspora.social/username',
            value: null,
            color: '#000000',
            label: 'Diaspora profile URL',
          },
          {
            name: 'Friendica',
            icon: 'friendica',
            placeholder: 'https://friendica.social/username',
            value: null,
            color: '#1d6e9a',
            label: 'Friendica profile URL',
          },
          {
            name: 'Twitter',
            icon: 'twitter',
            href: 'https://twitter.com/',
            placeholder: 'username',
            value: null,
            color: '#1da1f2',
            label: 'Twitter username',
          },
          {
            name: 'Mastodon',
            icon: 'mastodon',
            placeholder: 'https://mastodon.social/@username',
            value: null,
            color: '#2b90d9',
            label: 'Mastodon profile URL',
          },
          {
            name: 'LinkedIn',
            icon: 'linkedin',
            href: 'https://linkedin.com/',
            placeholder: 'in/username or company/companyname',
            value: null,
            color: '#0077b5',
            label: 'Linkedin username or companyname',
          },
          {
            name: 'YouTube',
            icon: 'youtube',
            href: 'https://youtube.com/',
            placeholder: 'channel name or ID',
            value: null,
            color: '#ff0000',
            label: 'Youtube channel name or ID',
          },
          {
            name: 'Vimeo',
            icon: 'vimeo',
            href: 'https://vimeo.com/',
            placeholder: 'channelname',
            value: null,
            color: '#1ab7ea',
            label: 'Vimeo channelname',
          },
          {
            name: 'Peertube',
            icon: 'peertube',
            placeholder: 'https://peertube.video/channelname',
            value: null,
            color: '#ffffff',
            light: 1,
            label: 'Peertube channel URL',
          },
          {
            name: 'Pinterest',
            icon: 'pinterest',
            href: 'https://pinterest.com/',
            placeholder: 'username',
            value: null,
            color: '#bd081c',
            label: 'Pinterest username',
          },
          {
            name: 'Behance',
            icon: 'behance',
            href: 'https://behance.net/',
            placeholder: 'username',
            value: null,
            color: '#1769ff',
            label: 'Behance username',
          },
          {
            name: 'Dribbble',
            icon: 'dribbble',
            href: 'https://dribbble.com/',
            placeholder: 'username',
            value: null,
            color: '#ea4c89',
            label: 'Dribbble username',
          },
          {
            name: 'Reddit',
            icon: 'reddit',
            href: 'https://reddit.com/',
            placeholder: 'username',
            value: null,
            color: '#ff5700',
            label: 'Reddit username',
          },
          {
            name: 'VK',
            icon: 'vk',
            href: 'https://vk.com/',
            placeholder: 'pagename',
            value: null,
            color: '#4a76a8',
            label: 'VK page URL',
          },
          {
            name: 'Snapchat',
            icon: 'snapchat',
            href: 'https://www.snapchat.com/add/',
            placeholder: 'username',
            value: null,
            color: '#fffc00',
            light: 1,
            label: 'Snapchat username',
          },
          {
            name: 'Tumblr',
            icon: 'tumblr',
            href: 'https://',
            hrefEnd: '.tumblr.com/',
            placeholder: 'username',
            value: null,
            color: '#2c4762',
            label: 'Tumblr blog URL',
          },
          {
            name: 'Quora',
            icon: 'quora',
            href: 'https://quora.com/',
            placeholder: 'username',
            value: null,
            color: '#a82400',
            label: 'Quora username',
          },
          {
            name: 'Medium',
            icon: 'medium',
            placeholder: 'https://medium.com/publication_name',
            value: null,
            color: '#000000',
            label: 'Medium publication',
          },
          {
            name: 'Discord',
            icon: 'discord',
            placeholder: 'https://discord.gg/invitecode',
            value: null,
            color: '#7289da',
            label: 'Discord channel invite link',
          },
          {
            name: 'Twitch',
            icon: 'twitch',
            href: 'https://twitch.tv/',
            placeholder: 'username',
            value: null,
            color: '#9146ff',
            label: 'Twitch username',
          },
          {
            name: 'Spotify',
            icon: 'spotify',
            href: 'https://open.spotify.com/user/',
            placeholder: 'username',
            value: null,
            color: '#1ed760',
            label: 'Spotify username',
          },
          {
            name: 'Soundcloud',
            icon: 'soundcloud',
            href: 'https://soundcloud.com/',
            placeholder: 'username',
            value: null,
            color: '#ff3300',
            label: 'Soundcloud username',
          },
          {
            name: 'Funkwhale',
            icon: 'funkwhale',
            placeholder: 'https://funkwhale.audio/username',
            value: null,
            color: '#ffffff',
            light: 1,
            label: 'Funkwhale username',
          },
          {
            name: 'GitHub',
            icon: 'github',
            href: 'https://github.com/',
            placeholder: 'username',
            value: null,
            color: '#333',
            label: 'Github username',
          },
          {
            name: 'GitLab',
            icon: 'gitlab',
            href: 'https://gitlab.com/',
            placeholder: 'username',
            value: null,
            color: '#171321 ',
            label: 'Gitlab username',
          },
          {
            name: 'Codeberg',
            icon: 'codeberg',
            href: 'https://codeberg.org/',
            placeholder: 'username',
            value: null,
            color: '#2185d0',
            label: 'Codeberg username',
          },
          {
            name: 'Yelp',
            icon: 'yelp',
            href: 'https://yelp.com/',
            placeholder: 'bizname',
            value: null,
            color: '#fff',
            light: 1,
            label: 'Yelp pagename',
          },
          {
            name: 'PayPal',
            icon: 'paypal',
            href: 'https://paypal.me/',
            placeholder: 'username',
            value: null,
            color: '#003087',
            label: 'PayPal.me URL',
          },
          {
            name: 'Patreon',
            icon: 'patreon',
            href: 'https://patreon.com/',
            placeholder: 'username',
            value: null,
            color: '#FF424D',
            label: 'Patreon URL',
          },
          {
            name: 'Open-Collective',
            icon: 'open-collective',
            href: 'https://opencollective.com/',
            placeholder: 'projectname',
            value: null,
            color: '#fff',
            light: 1,
            label: 'Open Collective projectname',
          },
          {
            name: 'TikTok',
            icon: 'tiktok',
            href: 'https://tiktok.com/',
            placeholder: 'username',
            value: null,
            color: '#fff',
            light: 1,
            label: 'TikTok username',
          },
          {
            name: 'Cash App',
            icon: 'cashapp',
            href: 'https://cash.app/',
            placeholder: '$username',
            value: null,
            color: '#fff',
            light: 1,
            label: 'Cash App username',
          },
          {
            name: 'Siilo',
            icon: 'siilo',
            href: 'https://app.siilo.com/qr/',
            placeholder: 'userID',
            value: null,
            color: '#17233b',
            label: 'Siilo userID',
          },
          {
            name: 'App Store',
            icon: 'appstore',
            placeholder: 'https://apps.apple.com/in/app/appname/id',
            value: null,
            color: 'linear-gradient(#5fc9f8, #147efb)',
            label: 'App Store developer/app URL',
          },
          {
            name: 'Play Store',
            icon: 'playstore',
            placeholder: 'https://play.google.com/store/apps/details?id=',
            value: null,
            color: '#fff',
            light: 1,
            label: 'Play Store developer/app URL',
          },
          {
            name: 'ArtStation',
            icon: 'artstation',
            href: 'https://www.artstation.com/',
            placeholder: 'username',
            value: null,
            color: '#171717',
            label: 'ArtStation username',
          },
          {
            name: 'Buy me a coffee',
            icon: 'buymeacoffee',
            href: 'https://www.buymeacoffee.com/',
            placeholder: 'username',
            value: null,
            color: '#ffdd00',
            light: 1,
            label: 'Buy me a coffee username',
          },
        ],
      },
      featured: [
        {
          title: 'Section title',
          content: [],
        },
      ],
      hostedURL: null,
      footerCredit: false,
      PreviewMode: true,
      content: null,
      inView: false,
      showPreview: false,
      scrollPos: null,
      opening: false,
      publishBusy: false,
      cardsLoading: false,
      authUser: null,
      userCards: [],
      currentCardId: null,
      currentCardSlug: null,
      actionCatalog: null,
      defaultDraft: null,
      defaultDownloadCheckList: null,
      draftHydrating: false,
      draftInitialized: false,
      draftSaveTimer: null,
      lastSavedDraftSignature: null,
    }
  },
  created() {
    this.actionCatalog = JSON.parse(JSON.stringify(this.actions))
    this.defaultDraft = JSON.parse(
      JSON.stringify({
        images: this.images,
        colors: this.colors,
        genInfo: this.genInfo,
        featured: this.featured,
        footerCredit: this.footerCredit,
      })
    )
    this.defaultDownloadCheckList = JSON.parse(
      JSON.stringify(this.downloadCheckList)
    )
  },
  watch: {
    images: {
      deep: true,
      handler() {
        this.scheduleDraftSave()
      },
    },
    colors: {
      deep: true,
      handler() {
        this.scheduleDraftSave()
      },
    },
    genInfo: {
      deep: true,
      handler() {
        this.scheduleDraftSave()
      },
    },
    primaryActions: {
      deep: true,
      handler() {
        this.scheduleDraftSave()
      },
    },
    secondaryActions: {
      deep: true,
      handler() {
        this.scheduleDraftSave()
      },
    },
    featured: {
      deep: true,
      handler() {
        this.scheduleDraftSave()
      },
    },
    theme() {
      this.scheduleDraftSave()
    },
    currentCardId() {
      this.scheduleDraftSave()
    },
    currentCardSlug() {
      this.scheduleDraftSave()
    },
    hostedURL() {
      this.scheduleDraftSave()
    },
  },
  computed: {
    ...mapState(['theme']),
    getFullname() {
      let fn = this.genInfo.fname
      let ln = this.genInfo.lname
      return (fn + ln).length ? `${fn ? fn : ''}${ln ? ' ' + ln : ''}` : null
    },
    downloadChecked() {
      return true
    },
    username() {
      return this.getFullname
        ? this.getFullname.toLowerCase().replace(/\W+/g, '')
        : 'username'
    },
    publishLabel() {
      return this.currentCardId ? 'Update live card' : 'Save live card'
    },
    orderedPrimaryActions() {
      return this.actions.primaryActions.sort((a, b) =>
        a.order > b.order ? 1 : a.order < b.order ? -1 : 0
      )
    },
    filteredPrimaryActions() {
      return this.orderedPrimaryActions.filter((e) =>
        e.name.toLowerCase().includes(this.filterPrimary.toLowerCase())
      )
    },
    orderedSecondaryActions() {
      return this.actions.secondaryActions.sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    },
    filteredSecondaryActions() {
      return this.orderedSecondaryActions.filter((e) =>
        e.name.toLowerCase().includes(this.filterSecondary.toLowerCase())
      )
    },
    vCard() {
      const getNumber = (type) => {
        let no = this.primaryActions
          .map((e) => (e.name == type ? e.value : null))
          .filter((e) => e)[0]
        return no ? no.replace(/\s/g, '') : null
      }
      let email = this.primaryActions
        .map((e) => (e.name == 'Email' ? e.value : null))
        .filter((e) => e)[0]
      let website = this.primaryActions
        .map((e) => (e.name == 'Website' ? e.value : null))
        .filter((e) => e)[0]
      let actions = [
        ...this.primaryActions,
        ...this.secondaryActions.map((e) => {
          return { ...e, isURL: 1 }
        }),
      ]
      let urls = actions
        .map((e) => {
          if (e.isURL && e.value) {
            return {
              title: e.name,
              url:
                (e.href ? e.href : '') + e.value + (e.hrefEnd ? e.hrefEnd : ''),
            }
          }
          return false
        })
        .filter((e) => e)

      let randomNumber = Math.floor(100000000 + Math.random() * 900000)
      return {
        fn: this.genInfo.fname,
        ln: this.genInfo.lname,
        title: this.genInfo.title,
        org: this.genInfo.biz,
        address: this.genInfo,
        cell: getNumber('Mobile'),
        work: getNumber('Office'),
        home: getNumber('Home'),
        sms: getNumber('SMS'),
        email,
        hostedURL: this.hostedURL,
        website,
        urls,
        uid: `EnBizCard-${randomNumber}`,
      }
    },
  },
  methods: {
    ...mapActions(['changeTheme']),
    togglePreview() {
      this.opening = true
      let c = this.$refs.container
      if (this.showPreview) {
        c.classList.remove('overflow-y-hidden', 'h-screen')
        window.scrollTo(0, this.scrollPos)
        this.opening = false
      } else {
        this.scrollPos = window.scrollY
        setTimeout(() => {
          c.classList.add('overflow-y-hidden', 'h-screen')
          this.opening = false
        }, 400)
      }
      this.showPreview = !this.showPreview
    },
    checkView() {
      let e = this.$refs.create
      if (e) {
        let top = e.getBoundingClientRect().top
        this.inView = this.showPreview ? true : top < 0
      }
    },
    clearContent() {
      this.content = null
    },
    getTitle(e) {
      return e.toLowerCase().split(' ').join('_')
    },
    addFeature() {
      this.featured.push({
        title: 'Section title',
        content: [],
      })
    },
    hasLightBG(e) {
      let hex = this.colors[e].color
      hex = hex.slice(1)
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
      }
      let r = parseInt(hex.slice(0, 2), 16)
      let g = parseInt(hex.slice(2, 4), 16)
      let b = parseInt(hex.slice(4, 6), 16)
      const brightness = Math.round(
        (parseInt(r) * 299 + parseInt(g) * 587 + parseInt(b) * 114) / 1000
      )
      return brightness > 125 ? true : false
    },
    showAlert(content) {
      this.content = content
    },
    clearFilterActions() {
      this.filterPrimary = this.filterSecondary = ''
    },
    filteredAction(filterType, actionType) {
      if (this[filterType].length)
        this.addAction(actionType, this[filterType][0].name)
      this.clearFilterActions()
    },
    addAction(type, name) {
      let index = this.actions[type].findIndex((e) => e.name === name)
      this[type].push(this.actions[type][index])
      this.actions[type].splice(index, 1)
      this.clearFilterActions()
    },
    removeAction(type, index) {
      this.actions[type].unshift(this[type][index])
      this[type].splice(index, 1)
    },
    downloadVcard() {
      let blob = new Blob([this.$refs.vCard.$refs.vCard.innerText], {
        type: 'text/plain',
      })
      saveAs(window.URL.createObjectURL(blob), `${this.username}.vcf`)
    },
    async resizeImage(type, mime, index1, index2) {
      let vm = this
      let reader = new FileReader()
      let file
      if (index2 >= 0) {
        if (type == 'image') {
          file = await this.featured[index1].content[index2].file
        } else if (type == 'music') {
          file = await this.featured[index1].content[index2].cover
        } else if (type == 'product') {
          file = await this.featured[index1].content[index2].image.file
        }
      } else {
        file = await this.images[type].blob
      }
      let canvas = document.createElement('canvas')
      let ctx = canvas.getContext('2d')
      let img = document.createElement('img')
      let maxWidth, maxHeight
      reader.onload = (e) => {
        img.src = e.target.result
        img.onload = () => {
          if (type == 'photo') {
            canvas.width = canvas.height = 320
          } else {
            if (type == 'logo') {
              maxWidth = 960
              maxHeight = 192
            } else {
              maxWidth = maxHeight = 960
            }
            let width = img.width
            let height = img.height

            if (width > maxWidth) {
              height *= maxWidth / width
              width = maxWidth
            }
            if (height > maxHeight) {
              width *= maxHeight / height
              height = maxHeight
            }
            canvas.width = width
            canvas.height = height
          }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          canvas.toBlob(
            (blob) => {
              let image = new File([blob], type, {
                type: mime,
              })
              if (index2 >= 0) {
                if (type == 'image') {
                  vm.featured[index1].content[index2].file = image
                } else if (type == 'music') {
                  vm.featured[index1].content[index2].cover = image
                } else if (type == 'product') {
                  vm.featured[index1].content[index2].image.file = image
                }
              } else {
                vm.images[type].resized = image
              }
            },
            mime,
            0.8
          )
        }
      }
      reader.readAsDataURL(file)
    },
    cloneDeep(value) {
      return JSON.parse(JSON.stringify(value))
    },
    async blobToDataURL(blob) {
      return await new Promise((resolve, reject) => {
        if (!blob) {
          resolve(null)
          return
        }

        const reader = new FileReader()
        reader.onload = (event) => resolve(event.target.result)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    },
    async resolveDataURL(existing, blob) {
      if (typeof existing === 'string' && existing.startsWith('data:')) {
        return existing
      }
      if (blob) {
        return await this.blobToDataURL(blob)
      }
      return existing || null
    },
    normalizeFeaturedItem(item) {
      if (!item || typeof item === 'string') {
        return item
      }

      if (item.contentType === 'text') {
        return {
          contentType: 'text',
          value: item.value || null,
        }
      }

      if (item.contentType === 'product') {
        return {
          ...item,
          image: item.image
            ? {
                ...item.image,
                file: null,
              }
            : null,
        }
      }

      if (item.contentType === 'media') {
        return {
          ...item,
          file: null,
          cover: null,
        }
      }

      return item
    },
    rebuildActionAvailability() {
      this.actions = this.cloneDeep(this.actionCatalog)

      const selectedPrimary = new Set(
        this.primaryActions.map((item) => item.name)
      )
      const selectedSecondary = new Set(
        this.secondaryActions.map((item) => item.name)
      )

      this.actions.primaryActions = this.actions.primaryActions.filter(
        (item) => !selectedPrimary.has(item.name)
      )
      this.actions.secondaryActions = this.actions.secondaryActions.filter(
        (item) => !selectedSecondary.has(item.name)
      )
    },
    async serializeFeatured() {
      return await Promise.all(
        this.featured.map(async (section) => {
          return {
            title: section.title || 'Section title',
            content: await Promise.all(
              (section.content || []).map(async (item) => {
                if (!item || typeof item === 'string') {
                  return item
                }

                if (item.contentType === 'text') {
                  return {
                    contentType: 'text',
                    value: item.value || null,
                  }
                }

                if (item.contentType === 'product') {
                  return {
                    ...this.cloneDeep(item),
                    image: item.image
                      ? {
                          ...this.cloneDeep(item.image),
                          dataURI: await this.resolveDataURL(
                            item.image.dataURI,
                            item.image.file
                          ),
                          file: null,
                        }
                      : null,
                  }
                }

                if (item.contentType === 'media') {
                  return {
                    ...this.cloneDeep(item),
                    dataURI: await this.resolveDataURL(item.dataURI, item.file),
                    coverDataURI: await this.resolveDataURL(
                      item.coverDataURI,
                      item.cover
                    ),
                    file: null,
                    cover: null,
                  }
                }

                return item
              })
            ),
          }
        })
      )
    },
    async serializeCardPayload() {
      const genInfo = this.cloneDeep(this.genInfo)
      genInfo.desc = null
      genInfo.key = null

      return {
        theme: this.theme,
        footerCredit: false,
        colors: this.cloneDeep(this.colors),
        genInfo,
        images: {
          logo: {
            url: this.images.logo.url,
            ext: this.images.logo.ext,
            mime: this.images.logo.mime,
          },
          photo: {
            url: this.images.photo.url,
            ext: this.images.photo.ext,
            mime: this.images.photo.mime,
          },
          cover: {
            url: this.images.cover.url,
            ext: this.images.cover.ext,
            mime: this.images.cover.mime,
          },
        },
        primaryActions: this.cloneDeep(this.primaryActions),
        secondaryActions: this.cloneDeep(this.secondaryActions),
        featured: await this.serializeFeatured(),
      }
    },
    async serializeDraftPayload() {
      return {
        ...(await this.serializeCardPayload()),
        currentCardId: this.currentCardId,
        currentCardSlug: this.currentCardSlug,
        hostedURL: this.hostedURL,
        downloadCheckList: this.cloneDeep(this.downloadCheckList),
      }
    },
    async apiJson(url, options = {}) {
      const response = await fetch(url, {
        credentials: 'same-origin',
        ...options,
      })
      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload.error || 'Request failed')
      }

      return payload
    },
    getCardURL(slug) {
      return `${window.location.origin}/vcard/${slug}`
    },
    async refreshUserCards() {
      if (!this.authUser) {
        this.userCards = []
        return
      }

      this.cardsLoading = true
      try {
        const payload = await this.apiJson('/api/cards')
        this.authUser = payload.user
        this.userCards = payload.cards || []
      } finally {
        this.cardsLoading = false
      }
    },
    async refreshAuth() {
      const previousEmail = this.authUser ? this.authUser.email : null
      const payload = await this.apiJson('/api/me')
      this.authUser = payload.user
      if (this.authUser) {
        if (this.authUser.email !== previousEmail) {
          this.draftInitialized = false
          this.lastSavedDraftSignature = null
        }
        await this.refreshUserCards()
        await this.loadLatestDraft()
      } else {
        this.userCards = []
      }
    },
    async loadLatestDraft() {
      if (!this.authUser || this.draftInitialized) {
        return
      }

      const payload = await this.apiJson('/api/draft')
      this.draftInitialized = true

      if (payload.draft && payload.draft.payload) {
        this.applyDraftPayload(payload.draft.payload)
        this.lastSavedDraftSignature = JSON.stringify(payload.draft.payload)
      }
    },
    scheduleDraftSave() {
      if (!this.authUser || this.draftHydrating) {
        return
      }

      clearTimeout(this.draftSaveTimer)
      this.draftSaveTimer = setTimeout(() => {
        this.saveDraft().catch((error) => {
          this.showAlert(error.message)
        })
      }, 1000)
    },
    async saveDraft() {
      if (!this.authUser || this.draftHydrating) {
        return
      }

      const payload = await this.serializeDraftPayload()
      const signature = JSON.stringify(payload)

      if (signature === this.lastSavedDraftSignature) {
        return
      }

      await this.apiJson('/api/draft', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          draft: payload,
        }),
      })

      this.lastSavedDraftSignature = signature
    },
    async copyText(value) {
      if (!value) {
        return
      }

      try {
        await navigator.clipboard.writeText(value)
        this.showAlert('Copied the URL to your clipboard.')
      } catch (error) {
        this.showAlert('Clipboard access is unavailable in this browser.')
      }
    },
    async copyCardLink(card) {
      await this.copyText(card.url || this.getCardURL(card.slug))
    },
    applyEditorState(data, options = {}) {
      const baseDraft = this.cloneDeep(this.defaultDraft)
      const baseDownloadCheckList = this.cloneDeep(
        this.defaultDownloadCheckList
      )

      this.draftHydrating = true
      this.images = {
        logo: { ...baseDraft.images.logo, ...((data.images || {}).logo || {}) },
        photo: { ...baseDraft.images.photo, ...((data.images || {}).photo || {}) },
        cover: { ...baseDraft.images.cover, ...((data.images || {}).cover || {}) },
      }
      this.colors = {
        logoBg: {
          ...baseDraft.colors.logoBg,
          ...((data.colors || {}).logoBg || {}),
        },
        mainBg: {
          ...baseDraft.colors.mainBg,
          ...((data.colors || {}).mainBg || {}),
        },
        buttonBg: {
          ...baseDraft.colors.buttonBg,
          ...((data.colors || {}).buttonBg || {}),
        },
        cardBg: {
          ...baseDraft.colors.cardBg,
          ...((data.colors || {}).cardBg || {}),
        },
      }
      this.genInfo = normalizeGenInfoAddress({
        ...baseDraft.genInfo,
        ...(data.genInfo || {}),
      })
      this.primaryActions = this.cloneDeep(data.primaryActions || [])
      this.secondaryActions = this.cloneDeep(data.secondaryActions || [])
      this.featured =
        data.featured && data.featured.length
          ? data.featured.map((section) => {
              return {
                title: section.title || 'Section title',
                content: (section.content || []).map((item) =>
                  this.normalizeFeaturedItem(item)
                ),
              }
            })
          : this.cloneDeep(baseDraft.featured)
      this.footerCredit = false
      this.downloadCheckList =
        options.downloadCheckList && options.downloadCheckList.length
          ? this.cloneDeep(options.downloadCheckList)
          : baseDownloadCheckList
      this.currentCardId = options.currentCardId || null
      this.currentCardSlug = options.currentCardSlug || null
      this.hostedURL = options.hostedURL || null
      this.changeTheme(data.theme || 1)
      this.rebuildActionAvailability()
      this.$nextTick(() => {
        this.draftHydrating = false
      })
    },
    applyLoadedCard(card) {
      this.applyEditorState(card.data || {}, {
        currentCardId: card.id,
        currentCardSlug: card.slug,
        hostedURL: card.url || this.getCardURL(card.slug),
      })
    },
    applyDraftPayload(payload) {
      this.applyEditorState(payload || {}, {
        currentCardId: payload.currentCardId || null,
        currentCardSlug: payload.currentCardSlug || null,
        hostedURL: payload.hostedURL || null,
        downloadCheckList: payload.downloadCheckList || [],
      })
    },
    async loadCard(card) {
      try {
        const payload = await this.apiJson(`/api/cards/${card.id}`)
        this.applyLoadedCard(payload.card)
        this.showAlert('Opened the published card in the editor.')
      } catch (error) {
        this.showAlert(error.message)
      }
    },
    async deleteCard(card) {
      if (
        !window.confirm(
          `Delete the hosted card${card.fullName ? ` for ${card.fullName}` : ''}?`
        )
      ) {
        return
      }

      try {
        await this.apiJson(`/api/cards/${card.id}`, {
          method: 'DELETE',
        })
        if (this.currentCardId === card.id) {
          this.currentCardId = null
          this.currentCardSlug = null
          this.hostedURL = null
        }
        await this.refreshUserCards()
      } catch (error) {
        this.showAlert(error.message)
      }
    },
    async publishCard() {
      if (!this.downloadChecked || this.publishBusy || !this.authUser) {
        return
      }

      this.publishBusy = true
      try {
        const payload = await this.serializeCardPayload()
        const result = await this.apiJson('/api/cards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: this.currentCardId,
            card: payload,
          }),
        })

        this.currentCardId = result.card.id
        this.currentCardSlug = result.card.slug
        this.hostedURL = result.card.url
        await this.refreshUserCards()
        this.showAlert(
          `Your card is live.<br /><br /><a class="underline font-extrabold text-emerald-600 hover:text-emerald-500 transition-colors duration-200" href="${this.hostedURL}" target="_blank" rel="noreferrer">Open the hosted card</a>`
        )
      } catch (error) {
        this.showAlert(error.message)
      } finally {
        this.publishBusy = false
      }
    },
  },
  mounted() {
    window.addEventListener('scroll', this.checkView)
    this.refreshAuth().catch((error) => {
      this.showAlert(error.message)
    })
    // window.onbeforeunload = function () {
    //   return 'Your work will be lost.'
    // }
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.checkView)
    clearTimeout(this.draftSaveTimer)
  },
}
</script>
