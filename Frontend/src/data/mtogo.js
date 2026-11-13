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
    delivery: '20–30 min  ·  Levering 19 kr.',
    image: '/images/restaurant-pizza.png'
  },
  {
    id: 'buns-and-friends',
    name: 'Buns & Friends',
    badge: 'Lokal favorit',
    kind: 'Burger · Amerikansk',
    rating: '★ 4,7 (180+)',
    delivery: '15–25 min  ·  Levering 15 kr.',
    image: '/images/restaurant-burger.png'
  },
  {
    id: 'green-kitchen',
    name: 'Green Kitchen',
    badge: 'Frisk & grønt',
    kind: 'Bowls · Grønt · Frisk',
    rating: '★ 4,9 (120+)',
    delivery: '20–35 min  ·  Levering 19 kr.',
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
  meta: '★ 4,8 (240+)     ·     20–30 min     ·     Levering 19 kr.     ·     Min. 99 kr.',
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

export const basket = {
  address: 'Til Nørrebrogade 18, København N',
  eta: 'Forventet levering 20–30 min',
  lines: [
    { name: 'Margherita', quantity: 1, price: 119 },
    { name: 'Burrata', quantity: 1, price: 129 }
  ],
  deliveryFee: 19
};

export const customer = {
  firstName: 'Sofie',
  lastName: 'Andersen',
  email: 'sofie.a@email.dk',
  phone: '+45 28 34 56 78',
  street: 'Nørrebrogade 18',
  postalCode: '2200',
  city: 'København N',
  floor: '2. tv.',
  since: 'Kunde · siden november 2026'
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

export const restaurantOrders = [
  {
    id: '#1043',
    customer: 'Emma Larsen',
    items: '1 × Diavola',
    amount: '158 kr.',
    status: 'Ny ordre',
    action: 'Accepter · Afvis'
  },
  {
    id: '#1042',
    customer: 'Mikkel Hansen',
    items: 'Margherita + Burrata',
    amount: '267 kr.',
    status: 'Klar til afhentning',
    action: 'Se ordre →'
  },
  {
    id: '#1041',
    customer: 'Clara Berg',
    items: '2 × Margherita',
    amount: '257 kr.',
    status: 'Tilberedes',
    action: 'Markér klar →'
  }
];

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
