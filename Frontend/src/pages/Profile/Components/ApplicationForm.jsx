import cx from '../../../utils/cx';
import ui from '../../../styles/shared.module.css';
import styles from '../Profile.module.css';

export default function ApplicationForm({ form, editing, onChange, onSubmit }) {
  return (
    <form className={ui.block} onSubmit={onSubmit}>
      <h2>{editing ? 'Ret ansøgning' : 'Ny restaurantansøgning'}</h2>
      <div className={ui.stack}>
        <div className={ui.field}>
          <label htmlFor="app-name">Restaurantnavn *</label>
          <input
            id="app-name"
            name="restaurantName"
            value={form.restaurantName}
            onChange={onChange}
          />
        </div>
        <div className={ui.field}>
          <label htmlFor="app-cvr">CVR-nummer *</label>
          <input id="app-cvr" name="cvr" value={form.cvr} onChange={onChange} />
        </div>
        <div className={ui.field}>
          <label htmlFor="app-street">Adresse *</label>
          <input id="app-street" name="street" value={form.street} onChange={onChange} />
        </div>
        <div className={ui.fieldRow}>
          <div className={ui.field}>
            <label htmlFor="app-zip">Postnummer *</label>
            <input id="app-zip" name="postalCode" value={form.postalCode} onChange={onChange} />
          </div>
          <div className={ui.field}>
            <label htmlFor="app-city">By *</label>
            <input id="app-city" name="city" value={form.city} onChange={onChange} />
          </div>
        </div>
        <div className={ui.fieldRow}>
          <div className={ui.field}>
            <label htmlFor="app-email">E-mail *</label>
            <input id="app-email" name="email" value={form.email} onChange={onChange} />
          </div>
          <div className={ui.field}>
            <label htmlFor="app-phone">Telefonnummer *</label>
            <input id="app-phone" name="phoneNumber" value={form.phoneNumber} onChange={onChange} />
          </div>
        </div>
        <div className={ui.field}>
          <label htmlFor="app-description">Beskrivelse af konceptet</label>
          <textarea
            id="app-description"
            name="description"
            value={form.description}
            onChange={onChange}
          />
        </div>
      </div>
      <button type="submit" className={cx(ui.btn, ui.btnPrimary, ui.btnBlock, styles.save)}>
        Indsend ansøgning
      </button>
    </form>
  );
}
