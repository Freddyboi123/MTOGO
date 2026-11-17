import cx from '../utils/cx';
import styles from './DataTable.module.css';

export default function DataTable({
  columns,
  rows,
  rowKey,
  selectedKey,
  onSelect,
  footLeft,
  footRight
}) {
  return (
    <>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const key = row[rowKey];
            return (
              <tr
                key={key}
                className={cx(onSelect && styles.selectable, key === selectedKey && styles.selected)}
                onClick={onSelect ? () => onSelect(row) : undefined}
              >
                {columns.map((column) => (
                  <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      {(footLeft || footRight) && (
        <div className={styles.foot}>
          <span>{footLeft}</span>
          <span>{footRight}</span>
        </div>
      )}
    </>
  );
}
