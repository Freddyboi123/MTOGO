import { useState } from 'react';
import AddressSearch from '../../../components/AddressSearch';
import { cuisines } from '../../../components/RestaurantFilters';
import cx from '../../../utils/cx';
import ui from '../../../styles/shared.module.css';
import styles from '../Profile.module.css';

export default function ApplicationForm({ form, editing, onChange, onAddressSelect, onSubmit }) {
  const [addressText, setAddressText] = useState(
    form.street ? `${form.street}, ${form.postalCode} ${form.city}` : ''
  );

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
          <label htmlFor="app-cuisine">Kategori *</label>
          <select id="app-cuisine" name="cuisine" value={form.cuisine ?? ''} onChange={onChange}>
            <option value="">Vælg kategori</option>
            {cuisines.map((cuisine) => (
              <option key={cuisine.value} value={cuisine.value}>
                {cuisine.label}
              </option>
            ))}
          </select>
        </div>
        <div className={ui.field}>
          <label htmlFor="app-cvr">CVR-nummer *</label>
          <input id="app-cvr" name="cvr" value={form.cvr} onChange={onChange} />
        </div>
        <AddressSearch
          id="app-address"
          label="Adresse *"
          text={addressText}
          onTextChange={setAddressText}
          onSelect={onAddressSelect}
        />
        <div className={ui.fieldRow}>
          <div className={ui.field}>
            <label htmlFor="app-zip">Postnummer</label>
            <input id="app-zip" value={form.postalCode} readOnly />
          </div>
          <div className={ui.field}>
            <label htmlFor="app-city">By</label>
            <input id="app-city" value={form.city} readOnly />
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
