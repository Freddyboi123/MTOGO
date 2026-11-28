import cx from '../../../utils/cx';
import ui from '../../../styles/shared.module.css';
import styles from '../DriverApplication.module.css';
import TimeOfDayPicker from './TimeOfDayPicker';

export default function DriverApplicationForm({
  form,
  profile,
  editing,
  vehicleLabels,
  regionLabels,
  timeOfDayLabels,
  onChange,
  onToggleTime,
  onSubmit
}) {
  const locked = (name) => Boolean(profile[name]);

  return (
    <form className={ui.block} onSubmit={onSubmit}>
      <h2>{editing ? 'Ret ansøgning' : 'Ny chaufførsansøgning'}</h2>
      <div className={ui.stack}>
        <div className={ui.fieldRow}>
          <div className={ui.field}>
            <label htmlFor="driver-first">Fornavn *</label>
            <input
              id="driver-first"
              name="firstname"
              value={form.firstname}
              readOnly={locked('firstname')}
              onChange={onChange}
            />
          </div>
          <div className={ui.field}>
            <label htmlFor="driver-last">Efternavn *</label>
            <input
              id="driver-last"
              name="lastname"
              value={form.lastname}
              readOnly={locked('lastname')}
              onChange={onChange}
            />
          </div>
        </div>
        <div className={ui.fieldRow}>
          <div className={ui.field}>
            <label htmlFor="driver-email">E-mail *</label>
            <input
              id="driver-email"
              name="email"
              value={form.email}
              readOnly={locked('email')}
              onChange={onChange}
            />
          </div>
          <div className={ui.field}>
            <label htmlFor="driver-phone">Telefonnummer *</label>
            <input
              id="driver-phone"
              name="phoneNumber"
              value={form.phoneNumber}
              readOnly={locked('phoneNumber')}
              onChange={onChange}
            />
          </div>
        </div>
        <p className={ui.fieldHint}>
          Navn, e-mail og telefonnummer hentes fra dine personlige oplysninger. Mangler der noget,
          skal du udfylde det her.
        </p>
        <div className={ui.fieldRow}>
          <div className={ui.field}>
            <label htmlFor="driver-vehicle">Transportmiddel *</label>
            <select id="driver-vehicle" name="vehicle" value={form.vehicle} onChange={onChange}>
              <option value="">Vælg transportmiddel</option>
              {Object.entries(vehicleLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className={ui.field}>
            <label htmlFor="driver-region">Region *</label>
            <select id="driver-region" name="region" value={form.region} onChange={onChange}>
              <option value="">Vælg region</option>
              {Object.entries(regionLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className={ui.field}>
          <label htmlFor="driver-hours">Forventede timer om ugen *</label>
          <input
            id="driver-hours"
            name="weeklyHours"
            type="number"
            min="1"
            max="80"
            value={form.weeklyHours}
            onChange={onChange}
          />
        </div>
        <TimeOfDayPicker labels={timeOfDayLabels} selected={form.timesOfDay} onToggle={onToggleTime} />
      </div>
      <button type="submit" className={cx(ui.btn, ui.btnPrimary, ui.btnBlock, styles.save)}>
        {editing ? 'Send igen' : 'Indsend ansøgning'}
      </button>
    </form>
  );
}
