# LandLink GitHub Pages Static Site

This folder contains a static GitHub Pages-ready version of the LandLink landing site.

## Files

- `index.html` — static homepage for GitHub Pages.
- `auth.html` — static phone OTP auth page that can connect to an external backend.
- `browse.html` — static browse listings page with filter controls, favorites, and compare actions.
- `sell.html` — static sell page with a listing form placeholder.
- `about.html` — static about page.
- `contact.html` — static contact page.
- `dashboard.html` — static dashboard placeholder page after OTP login.
- `landing.js` — shared JavaScript for navigation, search, local favorites, compare actions, and auth backend integration.

## Features added

- Local browser storage for favorite listings and compare selections.
- Dashboard state with remembered OTP login information.
- Dynamic login button that routes authenticated users to dashboard.
- Seller page guidance showing login status.
- Local UI feedback via toast messages on interactions.

## To use

1. Host this repository using GitHub Pages from the `docs/` folder.
2. Open `https://<your-name>.github.io/<repo>/` to view the static site.
3. If you want `auth.html` to connect to a real auth backend, update `AUTH_BACKEND_ORIGIN` in `docs/landing.js`.

## Connecting to an external auth app

Edit the top of `docs/landing.js`:

```js
const AUTH_BACKEND_ORIGIN = "https://YOUR-AUTH-APP-HOST.com";
```

Then deploy your auth backend with endpoints like:

- `POST ${AUTH_BACKEND_ORIGIN}/api/auth/send-otp`
- `POST ${AUTH_BACKEND_ORIGIN}/api/auth/verify-otp`

The static auth page will send OTP requests to that host.
