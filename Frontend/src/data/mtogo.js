export const restaurants = [
  {
    id: 'osteria-noerrebro',
    name: 'Osteria Nørrebro',
    badge: 'Populær',
    kind: 'Italiensk · Pizza · Pasta',
    rating: '★ 4,8 (240+)',
    delivery: '20–30 min',
    image: '/images/restaurant-pizza.png'
  },
  {
    id: 'buns-and-friends',
    name: 'Buns & Friends',
    badge: 'Lokal favorit',
    kind: 'Burger · Amerikansk',
    rating: '★ 4,7 (180+)',
    delivery: '15–25 min',
    image: '/images/restaurant-burger.png'
  },
  {
    id: 'green-kitchen',
    name: 'Green Kitchen',
    badge: 'Frisk & grønt',
    kind: 'Bowls · Grønt · Frisk',
    rating: '★ 4,9 (120+)',
    delivery: '20–35 min',
    image: '/images/restaurant-bowl.png'
  }
];

export const howItWorks = [
  {
    number: '01',
    title: 'Find dit næste måltid',
    body: 'Indtast din adresse, og udforsk de bedste køkkener i nærheden.'
  },
  {
    number: '02',
    title: 'Vælg dine favoritter',
    body: 'Sammensæt din bestilling. Vi giver dine ønsker videre til køkkenet.'
  },
  {
    number: '03',
    title: 'Nyd den gode smag',
    body: 'Få maden leveret til døren, eller hent den selv på vejen.'
  }
];

export const restaurant = {
  name: 'Osteria Nørrebro',
  eyebrow: 'Italiensk håndværk · København N',
  description: 'Napolitansk pizza, gode råvarer og lidt italiensk kærlighed.',
  meta: '★ 4,8 (240+)     ·     20–30 min     ·     Min. 99 kr.',
  openUntil: 'Åbent til 22.00',
  cover: '/images/restaurant-cover.png',
  categories: ['Populært', 'Pizza', 'Pasta', 'Tilbehør', 'Drikkevarer'],
  menuTitle: 'Pizza, som den skal være',
  menuIntro: 'Langtidshævet dej. Bagt ved 450°. Altid frisk fra ovnen.',
  items: [
    {
      name: 'Margherita',
      description: 'Tomat, fior di latte, frisk basilikum og ekstra jomfruolivenolie.',
      price: 119,
      flag: 'Gæsternes favorit'
    },
    {
      name: 'Burrata',
      description: 'Tomat, cremet burrata, cherrytomat og frisk basilikum.',
      price: 129,
      flag: null
    },
    {
      name: 'Diavola',
      description: 'Tomat, mozzarella, stærk salami og et strejf af chili.',
      price: 139,
      flag: null
    },
    {
      name: 'Funghi',
      description: 'Mozzarella, blandede svampe, timian og parmesan.',
      price: 129,
      flag: 'Vegetarisk'
    }
  ],
  drinks: [
    {
      name: 'San Pellegrino · 33 cl',
      description: 'Danskvand fra Italien',
      price: 29
    }
  ]
};

export const basketTexts = {
  title: 'Din bestilling',
  empty: 'Din kurv er tom. Tilføj en ret fra menuen.',
  from: 'Fra',
  otherRestaurant: 'Din kurv har retter fra en anden restaurant. Du kan kun bestille fra én restaurant ad gangen.',
  emptyAndAdd: 'Tøm kurven og tilføj',
  keep: 'Behold min bestilling',
  fewer: 'Færre',
  more: 'Flere',
  total: 'I alt',
  checkout: 'Gå til betaling',
  fine: 'Alle priser er inkl. levering og moms.'
};

export const checkoutTexts = {
  back: '← Tilbage til menuen',
  title: 'Lige om lidt er der mad.',
  crumbs: 'Kurv   →   Levering   →   Betaling',
  crumbsNote: 'Sikker betaling · Alle priser er inkl. moms',
  deliveryTitle: '01  Levering',
  street: 'Adresse',
  postalCode: 'Postnummer',
  city: 'By',
  paymentTitle: '02  Betaling',
  paymentNote: 'Betalingen er simuleret i denne version.',
  summaryTitle: 'Din bestilling',
  total: 'I alt',
  pay: 'Betal og bestil',
  sending: 'Bestiller…',
  terms: 'Ved at bestille accepterer du handelsbetingelserne.',
  hint: 'Inkl. levering og moms · Ingen ekstra gebyrer',
  emptyTitle: 'Din kurv er tom.',
  emptyLink: 'Find en restaurant →',
  loginRequired: 'Du skal være logget ind for at bestille.',
  login: 'Log ind',
  signUp: 'Opret konto',
  addressRequired: 'Udfyld adresse, postnummer og by.',
  paymentFailed: 'Betalingen blev afvist. Der er ikke oprettet nogen ordre.',
  failed: 'Ordren kunne ikke oprettes. Prøv igen om lidt.',
  confirmedTitle: 'Tak for din bestilling.',
  orderNumber: 'Ordrenummer',
  confirmedTotal: 'Betalt',
  confirmedNote: 'Restauranten har modtaget din ordre.',
  more: 'Bestil mere →'
};

export const applications = [
  {
    type: 'Restaurantpartner · A-026',
    title: 'Nabo Trattoria',
    status: 'Under behandling',
    submitted: 'Indsendt 10. november 2026',
    message: 'Vi har modtaget dine dokumenter og er i gang med at gennemgå dem.',
    action: 'Se restaurantansøgning →'
  },
  {
    type: 'Chaufførpartner · A-027',
    title: 'Levering med cykel',
    status: 'Mangler dokument',
    submitted: 'Indsendt 10. november 2026',
    message: 'Upload gyldig billedlegitimation, så vi kan behandle din ansøgning.',
    action: 'Upload legitimation'
  }
];

export const restaurantMenuRows = [
  { name: 'Margherita', price: '119 kr.', state: 'Aktiv' },
  { name: 'Burrata', price: '129 kr.', state: 'Aktiv' },
  { name: 'Diavola', price: '139 kr.', state: 'Aktiv' },
  { name: 'Funghi', price: '129 kr.', state: 'Aktiv' }
];

export const orderHistoryTexts = {
  title: 'Ordrehistorik',
  hint: 'Her kan du se dine tidligere ordrer.',
  loading: 'Henter dine ordrer…',
  error: 'Dine ordrer kunne ikke hentes.',
  empty: 'Du har ikke bestilt noget endnu.',
  statusChangedPrefix: 'Din ordre fra',
  statusChangedMiddle: 'er nu:',
  columns: {
    date: 'Dato',
    restaurant: 'Restaurant',
    total: 'Beløb',
    status: 'Status'
  }
};

export const restaurantOrderTexts = {
  title: 'Aktive ordrer',
  count: 'ordrer',
  loading: 'Henter ordrer…',
  error: 'Ordrerne kunne ikke hentes.',
  empty: 'Der er ingen ordrer endnu.',
  columns: {
    received: 'Modtaget',
    items: 'Indhold',
    address: 'Leveringsadresse',
    total: 'Beløb',
    status: 'Status',
    action: 'Handling'
  },
  startPreparing: 'Start tilberedning',
  markReady: 'Klar til afhentning',
  statusError: 'Status kunne ikke opdateres.',
  statuses: {
    RECEIVED: 'Ny ordre',
    PENDING: 'Afventer',
    ACCEPTED: 'Accepteret',
    PREPARING: 'Tilberedes',
    READY_FOR_PICKUP: 'Klar til afhentning',
    OUT_FOR_DELIVERY: 'På vej',
    DELIVERED: 'Leveret',
    CANCELLED: 'Annulleret'
  }
};

export const openDeliveries = [
  {
    id: '#1044',
    restaurant: 'Green Kitchen',
    route: 'Frederiksborggade 16 → Ravnsborggade 8',
    distance: '2,1 km · ca. 16 min',
    pay: '35 kr.'
  },
  {
    id: '#1045',
    restaurant: 'Buns & Friends',
    route: 'Istedgade 28 → Vesterbrogade 62',
    distance: '3,0 km · ca. 22 min',
    pay: '42 kr.'
  },
  {
    id: '#1046',
    restaurant: 'Spice House',
    route: 'Østerbrogade 65 → Blegdamsvej 24',
    distance: '2,4 km · ca. 18 min',
    pay: '38 kr.'
  }
];

export const restaurantPanelStats = {
  minimumOrder: '99 kr.',
  deliveryRadius: '4 km'
};

export const menuPanelTexts = {
  title: 'Menu & varer',
  add: '+ Tilføj vare',
  columns: {
    name: 'Vare',
    price: 'Pris',
    available: 'Tilgængelig',
    actions: 'Handling'
  },
  available: 'Aktiv',
  unavailable: 'Udsolgt',
  markUnavailable: 'Marker udsolgt',
  markAvailable: 'Gør aktiv',
  edit: 'Rediger',
  name: 'Navn',
  description: 'Beskrivelse',
  price: 'Pris (kr.)',
  saveNew: 'Gem vare',
  saveChanges: 'Gem ændringer',
  cancel: 'Annuller',
  saved: 'er gemt',
  categoryCount: 'kategorier',
  itemCount: 'varer'
};

export const courierPanelStats = {
  deliveriesToday: 6,
  earningsToday: '224 kr.',
  activeTrips: 1,
  plannedTrips: 0,
  area: 'København N',
  vehicle: 'Cykel',
  date: 'Onsdag den 11. november'
};

export const openingHours = [
  { days: 'Mandag – torsdag', hours: '11.00 – 22.00' },
  { days: 'Fredag – lørdag', hours: '11.00 – 23.00' },
  { days: 'Søndag', hours: '12.00 – 22.00' }
];

export const activeDelivery = {
  orderId: '#1042',
  itemCount: 2,
  status: 'På vej til afhentning · Maden er klar',
  distance: '2,4 km · ca. 18 min',
  pay: '38 kr.',
  stops: [
    {
      label: 'Afhentning',
      name: 'Osteria Nørrebro',
      address: 'Nørrebrogade 42, 2200 København N',
      note: 'Margherita + Burrata · 2 poser'
    },
    {
      label: 'Levering',
      name: 'Mikkel Hansen',
      address: 'Tagensvej 12, 1. th., 2200 København N',
      note: 'Ring på ved ankomst.'
    }
  ]
};


export const applyCourierSteps = [
  {
    number: '01',
    title: 'Udfyld din ansøgning',
    body: 'Fortæl om dig selv og dit køretøj.'
  },
  {
    number: '02',
    title: 'Få dine dokumenter godkendt',
    body: 'Du skal være fyldt 18 år og have ret til at arbejde i Danmark.'
  },
  {
    number: '03',
    title: 'Tag din første levering',
    body: 'Gå online, og vælg en ledig tur.'
  }
];

export const restaurantMenu = {
  back: '← Alle restauranter',
  loading: 'Henter menuen…',
  error: 'Restauranten kunne ikke findes. Prøv igen om lidt.',
  emptyMenu: 'Restauranten har ikke tilføjet en menu endnu.',
  emptyCategory: 'Der er ingen retter i denne kategori endnu.',
  unavailable: 'Udsolgt',
  currency: 'kr.',
  phone: 'Tlf.'
};

export const headerTexts = {
  da: {
    restaurants: 'Restauranter',
    howItWorks: 'Sådan fungerer det',
    partner: 'Bliv partner',
    basket: 'Kurv',
    profile: 'Profil',
    admin: 'Admin',
    login: 'Log ind',
    signUp: 'Opret konto',
    switchLanguage: 'EN',
    switchLanguageLabel: 'Switch to English'
  },
  en: {
    restaurants: 'Restaurants',
    howItWorks: 'How it works',
    partner: 'Become a partner',
    basket: 'Basket',
    profile: 'Profile',
    admin: 'Admin',
    login: 'Log in',
    signUp: 'Sign up',
    switchLanguage: 'DA',
    switchLanguageLabel: 'Skift til dansk'
  }
};

export const footerTexts = {
  da: {
    tagline: 'Gode måltider. Tættere på.',
    rights: '© 2026 MTOGO Alle rettigheder forbeholdes.',
    about: 'Om MTOGO',
    help: 'Hjælp & kontakt',
    partner: 'Bliv partner',
    privacy: 'Privatliv',
    terms: 'Handelsbetingelser',
    cookies: 'Cookies'
  },
  en: {
    tagline: 'Good meals. Closer to you.',
    rights: '© 2026 MTOGO All rights reserved.',
    about: 'About MTOGO',
    help: 'Help & contact',
    partner: 'Become a partner',
    privacy: 'Privacy',
    terms: 'Terms of sale',
    cookies: 'Cookies'
  }
};

export const roleLabels = {
  CUSTOMER: 'Kunde',
  RESTAURANT_OWNER: 'Restaurantejer',
  DELIVERY_AGENT: 'Bud',
  ADMIN: 'Administrator',
  OWNER: 'Ejer'
};

export const restaurantPanelTexts = {
  publicPage: 'Se offentlig side ↗',
  logout: 'Log ud',
  items: 'Varer på menuen',
  itemsNote: 'Alle varer i dine kategorier',
  unavailable: 'Udsolgte varer',
  unavailableNote: 'Kan ikke bestilles lige nu',
  categories: 'Kategorier',
  categoriesNote: 'På din menu'
};
