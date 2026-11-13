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
  components/   Shared layout and UI parts
  data/         Hardcoded content, replaced by the API later
  pages/        One file per page in the design
  styles.css    Design tokens and all styling
```

## Images

Export these from the Figma file and place them in `public/images/`.
Until then the pages render with the green placeholder colour.

| File | Figma layer |
| --- | --- |
| `hero-pizza.jpg` | Landingpage · Frisk pizza · Hero |
| `restaurant-pizza.jpg` | Landingpage · Pizza · Restaurantfoto |
| `restaurant-burger.jpg` | Landingpage · Burger · Restaurantfoto |
| `restaurant-bowl.jpg` | Landingpage · Bowl · Restaurantfoto |
| `restaurant-cover.jpg` | Restaurant menu eksempel · Restaurant cover |
| `auth-pizza.jpg` | Login · Friskbagt pizza |

## Design

Colours, type and spacing come from the Figma file and live as variables at the
top of `src/styles.css`. Inter and Playfair Display are loaded from Google Fonts
in `index.html`.
