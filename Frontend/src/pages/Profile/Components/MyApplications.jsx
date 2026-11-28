import { useState } from 'react';
import ui from '../../../styles/shared.module.css';
import DriverApplication from '../../DriverApplication/DriverApplication';
import ApplicationSwitch from './ApplicationSwitch';
import RestaurantApplications from './RestaurantApplications';

const applicationTypes = [
  { value: 'restaurant', label: 'Restaurant ansøgninger' },
  { value: 'driver', label: 'Driver ansøgninger' }
];

export default function MyApplications() {
  const [type, setType] = useState('restaurant');

  return (
    <>
      <div className={ui.block}>
        <h2>Mine ansøgninger</h2>
        <ApplicationSwitch options={applicationTypes} selected={type} onSelect={setType} />
      </div>

      {type === 'restaurant' && <RestaurantApplications />}
      {type === 'driver' && <DriverApplication />}
    </>
  );
}
