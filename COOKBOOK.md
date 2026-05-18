# Cookbook: Create a Digital Business Card on `vcard.xuno.ch`

This guide shows how to create, publish, and reuse a digital business card on `https://vcard.xuno.ch`.

## Before you start

- You must sign in through Cloudflare Access before you can save a card.
- The email address used for Cloudflare authentication **must end with `nexus.ethz.ch`**.
- If your signed-in email does not end with `nexus.ethz.ch`, you may be able to open the editor, but you should expect saving or publishing access to be unavailable.
- It helps to prepare these assets in advance:
  - Profile photo
  - Cover image
  - Logo
  - Contact details
  - Social/profile links
  - Optional PDFs, images, audio, or video for featured content

## Sign in

1. Open `https://vcard.xuno.ch`.
2. Complete the Cloudflare login flow.
3. Check the top-right corner of the page.
4. Confirm that the signed-in email is the account you want to use, and that it ends with `nexus.ethz.ch`.

## Create your card

The editor is split into sections. You can work from top to bottom.

### 1. Header attachments

- Add a logo.
- Add a cover photo.
- Recommended cover size: `960 x 640` pixels with a `3:2` aspect ratio.

### 2. Contact information

- Add a profile photo.
- Recommended profile photo size: `320 x 320` pixels with a `1:1` aspect ratio.
- Fill in:
  - First name
  - Last name
  - Pronouns, if wanted
  - Job title
  - Business name
  - Business address

### 3. Primary actions

Use primary actions for the most important ways to contact you. Typical examples:

- Mobile
- Office
- SMS
- Email
- Website
- Store
- Location
- Signal
- Telegram
- WhatsApp
- Calendar

Tips:

- Add only the actions you really use.
- Put the most important ones first.
- Use complete values, especially for phone numbers and URLs.

### 4. Secondary actions

Use this section for social and profile links, for example:

- LinkedIn
- GitHub
- Instagram
- YouTube
- X/Twitter
- Mastodon
- Discord
- App Store / Play Store

### 5. Featured content

You can add one or more sections with extra content such as:

- Images
- PDFs
- Audio
- Video
- Product or portfolio material

Supported media formats include:

- `jpeg`
- `png`
- `mp3`
- `mp4`
- `webm`
- `pdf`

### 6. Theme, colours, and fonts

- Choose one of the built-in themes.
- Adjust header, background, button, and featured-content colours.
- Optionally add a web font embed code and matching CSS rule.

### 7. Preview while you edit

- Use the live preview to check layout and readability.
- On mobile, use the `Open preview` button.
- Review the card once on desktop and once on a phone-sized screen before publishing.

## Save and publish

1. Scroll to the save section.
2. Click `Save live card`.
3. If you are editing an existing card, the button changes to `Update live card`.
4. After saving, open the generated public URL and review it once.

Notes:

- Draft changes are automatically saved for signed-in users while editing.
- Published cards appear in the `Your published cards` section.
- From there, you can:
  - Open the live card
  - Copy the public link
  - Re-open the card in the editor
  - Delete the card

## Share your public card

After publishing, your live card gets a public URL in this format:

`https://vcard.xuno.ch/vcard/<your-card-slug>`

Share that URL in:

- Email signatures
- Personal websites
- Slides
- QR codes
- Conference profiles
- Messaging apps

## Update an existing card

1. Open `https://vcard.xuno.ch`.
2. Sign in with the same Cloudflare account.
3. In `Your published cards`, click the edit button for the card you want.
4. Make your changes.
5. Click `Update live card`.

The public URL stays the same when you update the same card.

## Add the card to an iPhone from Safari

There are two useful options on iPhone: a regular Safari bookmark and a Home Screen icon.

### Option A: Save as a Safari bookmark

1. Open Safari on the iPhone.
2. Open your published card URL.
3. Tap the More button, then tap `Add Bookmark to`.
4. Choose the bookmark location.
5. Tap `Save`.

### Option B: Add to the Home Screen

1. Open Safari on the iPhone.
2. Open your published card URL.
3. Tap the More button, then tap `Share`.
4. Scroll down and tap `Add to Home Screen`.
5. Optionally enable `Open as Web App`.
6. Tap `Add`.

If `Add to Home Screen` is not visible:

1. Scroll to the bottom of the action list.
2. Tap `Edit Actions`.
3. Add `Add to Home Screen`.

## Add the card to Android

The most reliable method is to use Chrome on Android.

1. Open Chrome on the Android phone.
2. Open your published card URL.
3. Tap the three-dot menu or `More` button.
4. Tap `Add to home screen`.
5. Tap `Create shortcut` if Chrome asks.
6. Tap `Add`.

Notes:

- The exact wording can vary slightly by Android version and phone manufacturer.
- If you do not see `Add to home screen`, make sure you are using Chrome.

## Troubleshooting

### I cannot save the card

Check these first:

- You are signed in.
- The email shown in the top-right corner ends with `nexus.ethz.ch`.
- Cloudflare Access authentication completed successfully.

### I saved the card but do not know where it went

- Look in the `Your published cards` section.
- Use the copy-link action there.
- Open the card once to confirm the public URL.

### The card looks crowded on mobile

- Reduce the number of primary actions.
- Move less important links to secondary actions.
- Use shorter labels where possible.
- Use fewer featured sections.

## Recommended workflow

1. Prepare text, links, and images first.
2. Fill in contact information.
3. Add only the most important primary actions.
4. Add secondary links.
5. Add featured content last.
6. Preview on mobile.
7. Publish.
8. Add the final public card to your phone Home Screen.

## References

- Apple Support: https://support.apple.com/guide/iphone/bookmark-favorite-webpages-iph42ab2f3a7/ios
- Apple Support: https://support.apple.com/en-au/guide/iphone/iphea86e5236/ios
- Google Chrome Help: https://support.google.com/chrome/answer/15085120?co=GENIE.Platform%3DAndroid&hl=en
