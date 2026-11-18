# MTOGO Frontend

React and Vite frontend for MTOGO, built from the team's Figma design.
All data is hardcoded in `src/data/mtogo.js` and is replaced with calls to the
backend when the API is ready.

## Getting started

```
cd Frontend
npm install
npm run dev
```

The app runs on http://localhost:5173

## Pages

| Route | Page |
| --- | --- |
| `/` | Landing page |
| `/restauranter` | Restaurant overview, loaded from the API (flag `restaurantOverview`) |
| `/restaurant/:id` | Restaurant page with the menu from the API, split into categories (flag `restaurantOverview`). The basket is still template data |
| `/betaling` | Checkout |
| `/login` | Log in |
| `/opret-konto` | Sign up |
| `/glemt-adgangskode` | Forgot password |
| `/ansoeg/restaurant` | Apply as a restaurant |
| `/ansoeg/chauffoer` | Apply as a delivery agent |
| `/min-profil` | Profile and applications |
| `/restaurantpanel` | Restaurant partner panel |
| `/chauffoerpanel` | Delivery agent panel |
| `/admin/restauranter` | Admin: restaurants |
| `/admin/chauffoerer` | Admin: delivery agents |
| `/admin/ansoegninger/restaurant` | Admin: restaurant applications |
| `/admin/ansoegninger/chauffoer` | Admin: delivery agent applications |

## Structure

```
src/
  components/           Shared layout and UI parts, each with its own CSS module
  data/mtogo.js         All content and numbers, replaced by the API later
  pages/                One file per page in the design, each with its own CSS module
  styles/global.css     Design tokens, reset and base element styles
  styles/shared.module.css  Buttons, fields, cards and other shared classes
  utils/cx.js           Joins class names
```

All styling lives in `.css` files. Components and pages use CSS modules, so class
names are scoped to the file that owns them, and the only global stylesheet is
`styles/global.css`. There are no inline styles and no CSS framework.

Numbers shown on the pages come from `data/mtogo.js`, not from the markup, so a
count changes when the data changes.

## Feature flags

Unfinished features are hidden behind feature flags, as required by the Definition of Done.
The backend owns the flags and serves them at `GET /api/features`. The frontend loads them
once at startup in `featureFlags/FeatureFlagProvider.jsx`, and pages read a flag with
`useFeatureFlag('flagName')`. If the flags cannot be fetched, every flag counts as off.

To add a flag:

1. Add it to the `FeatureFlag` enum in the backend, with the name the frontend uses.
2. Add `FEATURE_<NAME>=true` (or `false`) to `Backend/src/main/resources/feature-flags.properties`.
   The file is committed, so the whole team gets the flag when they pull. A flag that is not set counts as off.
   An environment variable with the same name overrides the file, which is how a feature is switched off
   on the server without a deploy.
3. Hide the route, link or component with `useFeatureFlag('flagName')`.

When the feature is done and turned on in production, remove the flag again.

## Images

The images from the Figma file are in `public/images/`.

| File | Figma layer |
| --- | --- |
| `hero-pizza.png` | Landingpage · Frisk pizza · Hero |
| `restaurant-pizza.png` | Landingpage · Pizza · Restaurantfoto |
| `restaurant-burger.png` | Landingpage · Burger · Restaurantfoto |
| `restaurant-bowl.png` | Landingpage · Bowl · Restaurantfoto |
| `restaurant-cover.png` | Restaurant menu eksempel · Restaurant cover |
| `auth-pizza.png` | Login · Friskbagt pizza |

## Design

Colours, type and spacing come from the Figma file and live as variables in
`src/styles/global.css`. Inter and Playfair Display are loaded from Google Fonts
in `index.html`.

## Docker

The `Dockerfile` builds the app with Node and serves it with nginx. The address of
the backend is passed as the build argument `VITE_API_URL`. The CD pipeline builds
the image when code is pushed to `main`.
