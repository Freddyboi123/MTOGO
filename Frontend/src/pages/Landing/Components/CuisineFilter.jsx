import { useState } from 'react';
import { cuisines } from '../../../data/mtogo';
import cx from '../../../utils/cx';
import ui from '../../../styles/shared.module.css';
import styles from '../Landing.module.css';

export default function CuisineFilter() {
  const [activeCuisine, setActiveCuisine] = useState(cuisines[0]);

  return (
    <section className={cx(ui.page, styles.section)}>
      <h2 className={styles.sectionTitleSmall}>Hvad har du lyst til?</h2>
      <div className={styles.chips}>
        {cuisines.map((cuisine) => (
          <button
            key={cuisine}
            className={cuisine === activeCuisine ? styles.chipActive : styles.chip}
            onClick={() => setActiveCuisine(cuisine)}
          >
            {cuisine}
          </button>
        ))}
      </div>
    </section>
  );
}
