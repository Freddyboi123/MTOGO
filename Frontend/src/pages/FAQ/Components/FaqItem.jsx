import styles from '../FAQ.module.css';

export default function FaqItem({ question, answer }) {
  return (
    <details className={styles.item}>
      <summary className={styles.question}>{question}</summary>
      <p className={styles.answer}>{answer}</p>
    </details>
  );
}
