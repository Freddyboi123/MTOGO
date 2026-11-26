export const cuisines = [
  'Alle køkkener',
  'Pizza',
  'Burger',
  'Sushi',
  'Asiatisk',
  'Grønt & sundt',
  'Italiensk',
  'Indisk'
];

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

export const adminRestaurants = [
  {
    name: 'Osteria Nørrebro',
    contact: 'Luca Moretti',
    area: 'København N',
    status: 'Aktiv'
  },
  {
    name: 'Buns & Friends',
    contact: 'Emma Larsen',
    area: 'København V',
    status: 'Aktiv'
  },
  {
    name: 'Green Kitchen',
    contact: 'Oliver Holm',
    area: 'København K',
    status: 'Aktiv'
  },
  {
    name: 'Sakura Sushi',
    contact: 'Mei Tanaka',
    area: 'Frederiksberg',
    status: 'Pauset'
  },
  {
    name: 'Spice House',
    contact: 'Arjun Patel',
    area: 'København Ø',
    status: 'Aktiv'
  },
  {
    name: 'Pasta & Co.',
    contact: 'Mads Jensen',
    area: 'København S',
    status: 'Aktiv'
  }
];

export const adminCouriers = [
  {
    name: 'Jonas Nielsen',
    email: 'jonas.n@email.dk',
    vehicle: 'Cykel',
    status: 'På levering'
  },
  {
    name: 'Freja Møller',
    email: 'freja.m@email.dk',
    vehicle: 'Elcykel',
    status: 'Tilgængelig'
  },
  {
    name: 'Noah Hansen',
    email: 'noah.h@email.dk',
    vehicle: 'Bil',
    status: 'Offline'
  },
  {
    name: 'Ida Petersen',
    email: 'ida.p@email.dk',
    vehicle: 'Cykel',
    status: 'Tilgængelig'
  },
  {
    name: 'Oscar Lund',
    email: 'oscar.l@email.dk',
    vehicle: 'Scooter',
    status: 'Pauset'
  },
  {
    name: 'Clara Berg',
    email: 'clara.b@email.dk',
    vehicle: 'Elcykel',
    status: 'På levering'
  }
];

export const restaurantApplications = [
  {
    id: 'A-026',
    name: 'Nabo Trattoria',
    applicant: 'Sofie Andersen',
    received: '10. nov.',
    status: 'Under behandling'
  },
  {
    id: 'A-028',
    name: 'Seoul Table',
    applicant: 'Min Park',
    received: '11. nov.',
    status: 'Ny'
  },
  {
    id: 'A-029',
    name: 'Café Morgen',
    applicant: 'Anna Dahl',
    received: '11. nov.',
    status: 'Ny'
  }
];

export const courierApplications = [
  {
    id: 'A-027',
    name: 'Sofie Andersen',
    detail: 'Cykel · København N',
    received: '10. nov.',
    status: 'Mangler dokument'
  },
  {
    id: 'A-030',
    name: 'Amalie Sørensen',
    detail: 'Elcykel · København K',
    received: '11. nov.',
    status: 'Ny'
  },
  {
    id: 'A-031',
    name: 'Ali Hassan',
    detail: 'Bil · Frederiksberg',
    received: '11. nov.',
    status: 'Ny'
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

export const restaurantTotals = {
  all: 24,
  active: 21,
  paused: 3,
  area: 'På tværs af København'
};

export const courierTotals = {
  approved: 18,
  online: 12,
  onTrip: 8,
  available: 4
};

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

export const restaurantApplicationDetail = {
  applicantEmail: 'sofie.a@email.dk',
  applicantPhone: '+45 28 34 56 78',
  address: 'Nørrebrogade 88, 2200 København N',
  registration: 'CVR 12345678 · Italiensk · 11.00–22.00',
  documents: [
    { name: 'CVR-registrering.pdf', state: 'Kontrolleret  ·  Se →' },
    { name: 'Fødevaregistrering.pdf', state: 'Vedhæftet  ·  Se →' }
  ],
  activity: [
    { when: '10. nov. · 14.32', text: 'Ansøgning modtaget fra Sofie Andersen.' },
    { when: '11. nov. · 09.10', text: 'CVR-oplysninger kontrolleret.' },
    { when: '11. nov. · 09.15', text: 'Sagen er klar til din vurdering.' }
  ]
};

export const courierApplicationDetail = {
  applicantEmail: 'sofie.a@email.dk',
  applicantPhone: '+45 28 34 56 78',
  requirements: '18+ bekræftet · Ret til at arbejde i Danmark',
  documents: [
    { name: 'Arbejdstilladelse.pdf', state: 'Vedhæftet  ·  Se →' },
    { name: 'Billedlegitimation', state: 'Mangler  ·  Påmind →' }
  ],
  activity: [
    { when: '10. nov. · 15.04', text: 'Chaufføransøgning modtaget.' },
    { when: '11. nov. · 09.20', text: 'Legitimation mangler i ansøgningen.' },
    { when: '11. nov. · 09.25', text: 'Sofie er bedt om at uploade dokumentet.' }
  ]
};

export const selectedAdminRestaurant = {
  name: 'Osteria Nørrebro',
  id: 'R-001',
  address: 'Nørrebrogade 42, 2200 København N',
  contact: 'luca@osteria.dk  ·  +45 22 34 56 78',
  opening: 'Åbent i dag 11.00–22.00  ·  Leveringsområde: 4 km'
};

export const selectedAdminCourier = {
  name: 'Jonas Nielsen',
  id: 'D-014',
  area: 'København N',
  approved: 'Godkendt 2. november 2026',
  contact: 'jonas.n@email.dk  ·  +45 23 45 67 89',
  record: 'Dokumenter godkendt  ·  128 leverancer  ·  Bedømmelse 4,9 / 5'
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

export const profileSections = [
  'Personlige oplysninger',
  'Leveringsadresse',
  'Mine ansøgninger',
  'Ordrehistorik',
  'Sikkerhed'
];

export const restaurantOverview = {
  eyebrow: 'Alle restauranter',
  title: 'Find dit næste måltid',
  lead: 'Udforsk restauranterne på MTOGO, og vælg hvor du vil bestille fra.',
  loading: 'Henter restauranter…',
  error: 'Restauranterne kunne ikke hentes. Prøv igen om lidt.',
  empty: 'Der er ingen restauranter endnu.'
};

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
  restaurants: 'Restauranter',
  howItWorks: 'Sådan fungerer det',
  partner: 'Bliv partner',
  basket: 'Kurv',
  profile: 'Profil',
  login: 'Log ind',
  signUp: 'Opret konto'
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
