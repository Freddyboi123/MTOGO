import styles from './Panel.module.css';

export default function Panel({ title, subtitle, controls, right, children }) {
  const hasHead = title || subtitle || controls || right;

  return (
    <section className={styles.panel}>
      {hasHead && (
        <header className={styles.head}>
          {(title || subtitle) && (
            <div>
              {title && <h2 className={styles.title}>{title}</h2>}
              {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
          )}
          {controls}
          {right && <span className={styles.right}>{right}</span>}
        </header>
      )}
      {children}
    </section>
  );
}
