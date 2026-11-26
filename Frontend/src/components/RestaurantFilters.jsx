import styles from './RestaurantFilters.module.css';

// The categories a restaurant can have. The value is what the backend stores and filters on.
export const cuisines = [
  { value: 'PIZZA', label: 'Pizza' },
  { value: 'BURGER', label: 'Burger' },
  { value: 'SUSHI', label: 'Sushi' },
  { value: 'ASIATISK', label: 'Asiatisk' },
  { value: 'GROENT', label: 'Grønt & sundt' },
  { value: 'ITALIENSK', label: 'Italiensk' },
  { value: 'INDISK', label: 'Indisk' }
];

export function cuisineLabel(value) {
  return cuisines.find((cuisine) => cuisine.value === value)?.label ?? '';
}

export default function RestaurantFilters({ cuisine, onCuisineChange, query, onQueryChange }) {
  return (
    <div>
      <div className={styles.chips}>
        <button
          type="button"
          className={cuisine === '' ? styles.chipActive : styles.chip}
          onClick={() => onCuisineChange('')}
        >
          Alle køkkener
        </button>
        {cuisines.map((item) => (
          <button
            key={item.value}
            type="button"
            className={cuisine === item.value ? styles.chipActive : styles.chip}
            onClick={() => onCuisineChange(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <input
        type="search"
        className={styles.search}
        placeholder="Søg efter restaurant"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
      />
    </div>
  );
}
