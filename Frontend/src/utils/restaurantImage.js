const fallback = '/images/restaurant-cover.png';

const images = [
  { match: /burger/i, src: '/images/restaurant-burger.png' },
  { match: /sushi|bowl|poke|asian|thai|ramen/i, src: '/images/restaurant-bowl.png' },
  { match: /pizza|ital/i, src: '/images/restaurant-pizza.png' }
];

export default function restaurantImage(restaurant) {
  const text = `${restaurant?.name ?? ''} ${restaurant?.description ?? ''}`;
  return images.find((image) => image.match.test(text))?.src ?? fallback;
}
