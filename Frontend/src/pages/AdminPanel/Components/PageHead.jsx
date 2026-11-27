import ui from '../../../styles/shared.module.css';
import dash from '../../../components/DashboardLayout.module.css';

export default function PageHead({ title, subtitle }) {
  return (
    <div className={dash.head}>
      <div>
        <p className={ui.eyebrow}>Partneradministration</p>
        <h1 className={dash.title}>{title}</h1>
        <p className={dash.subtitle}>{subtitle}</p>
      </div>
    </div>
  );
}
