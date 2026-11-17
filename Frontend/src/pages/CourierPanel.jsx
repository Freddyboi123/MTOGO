import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import cx from '../utils/cx';
import ui from '../styles/shared.module.css';
import dash from '../components/DashboardLayout.module.css';
import styles from './CourierPanel.module.css';
import { activeDelivery, courierPanelStats, openDeliveries } from '../data/mtogo';

const items = [
  { to: '/chauffoerpanel', label: 'Leverancer' },
  { to: '/chauffoerpanel/ture', label: 'Mine ture' },
  { to: '/chauffoerpanel/indtjening', label: 'Indtjening' },
  { to: '/chauffoerpanel/dokumenter', label: 'Dokumenter' },
  { to: '/chauffoerpanel/indstillinger', label: 'Indstillinger' }
];

export default function CourierPanel() {
  return (
    <DashboardLayout
      role="Chaufførpartner"
      items={items}
      breadcrumb="Chauffør  /  Leverancer"
      user="Jonas Nielsen"
    >
      <div className={dash.head}>
        <div>
          <p className={ui.eyebrow}>Godt at have dig på vejen, Jonas</p>
          <h1 className={dash.title}>Dine leverancer</h1>
          <p className={dash.subtitle}>
            {courierPanelStats.area} · {courierPanelStats.vehicle} · {courierPanelStats.date}
          </p>
        </div>
        <div className={dash.actions}>
          <span className={styles.onlinePill}>
            <span className={styles.dot} />
            Du er online
          </span>
          <button className={cx(ui.btn, ui.btnOutline, ui.btnSmall)}>Gå offline</button>
        </div>
      </div>

      <div className={dash.statGrid}>
        <StatCard
          label="Leveringer i dag"
          value={courierPanelStats.deliveriesToday}
          note="Tak for de gode ture"
        />
        <StatCard
          label="Indtjening i dag"
          value={courierPanelStats.earningsToday}
          note="Før skat · ekskl. drikkepenge"
        />
        <StatCard
          label="Dine ture"
          value={`${courierPanelStats.activeTrips} aktiv`}
          note={`${courierPanelStats.plannedTrips} planlagte efterfølgende`}
        />
      </div>

      <div className={styles.split}>
        <div>
          <div className={styles.listHead}>
            <div>
              <h2 className={styles.listTitle}>Ledige leverancer</h2>
              <p className={styles.listNote}>
                {openDeliveries.length} ture i nærheden · opdateret lige nu
              </p>
            </div>
            <span className={ui.linkQuiet}>Nærmest først ▾</span>
          </div>

          {openDeliveries.map((delivery) => (
            <article className={styles.delivery} key={delivery.id}>
              <div>
                <div className={styles.deliveryLabel}>LEDIG · {delivery.id}</div>
                <h3 className={styles.deliveryName}>{delivery.restaurant}</h3>
                <p className={styles.deliveryRoute}>{delivery.route}</p>
                <p className={styles.deliveryRoute}>{delivery.distance}</p>
              </div>
              <div>
                <div className={styles.deliveryPay}>{delivery.pay}</div>
                <button className={cx(ui.btn, ui.btnDark, ui.btnSmall, styles.takeButton)}>
                  Tag levering
                </button>
              </div>
            </article>
          ))}

          <p className={cx(ui.fieldHint, styles.footnote)}>
            Nye ture planlægges efter din aktive levering. Se ruten, før du accepterer.
          </p>
        </div>

        <div>
          <div className={ui.block}>
            <h2 className={styles.activeTitle}>Din aktive levering</h2>
            <p className={cx(ui.sectionLabel, styles.activeMeta)}>
              ORDRE {activeDelivery.orderId} · {activeDelivery.itemCount} VARER
            </p>
            <div className={styles.statusStrip}>{activeDelivery.status}</div>

            {activeDelivery.stops.map((stop, index) => (
              <div className={styles.stop} key={stop.label}>
                <div className={styles.stopDot}>{index + 1}</div>
                <div>
                  <div className={ui.sectionLabel}>{stop.label.toUpperCase()}</div>
                  <strong className={styles.stopName}>{stop.name}</strong>
                  <span className={styles.stopLine}>{stop.address}</span>
                  <span className={styles.stopLine}>{stop.note}</span>
                </div>
              </div>
            ))}

            <div className={styles.summary}>
              <span>{activeDelivery.distance}</span>
              <span>Din betaling: {activeDelivery.pay}</span>
            </div>

            <button className={cx(ui.btn, ui.btnOutline, ui.btnBlock, styles.routeButton)}>
              Åbn rute ↗
            </button>
            <button className={cx(ui.btn, ui.btnPrimary, ui.btnBlock, styles.confirmButton)}>
              Bekræft afhentning
            </button>
          </div>

          <div className={ui.block}>
            <h3 className={styles.helpTitle}>Brug for hjælp på turen?</h3>
            <p className={cx(ui.linkAccent, styles.helpLink)}>Kontakt leveringssupport →</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
