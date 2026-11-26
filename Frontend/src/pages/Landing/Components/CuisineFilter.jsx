import RestaurantFilters from '../../../components/RestaurantFilters';
import cx from '../../../utils/cx';
import ui from '../../../styles/shared.module.css';
import styles from '../Landing.module.css';

export default function CuisineFilter({ cuisine, onCuisineChange, query, onQueryChange }) {
  return (
    <section className={cx(ui.page, styles.section)}>
      <h2 className={styles.sectionTitleSmall}>Hvad har du lyst til?</h2>
      <RestaurantFilters
        cuisine={cuisine}
        onCuisineChange={onCuisineChange}
        query={query}
        onQueryChange={onQueryChange}
      />
    </section>
  );
}
