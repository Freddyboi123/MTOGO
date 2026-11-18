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
| `/restaurant` | Restaurant page with menu and basket |
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
