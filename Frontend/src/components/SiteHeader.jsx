import { Link } from 'react-router-dom';

export default function SiteHeader({ variant = 'marketing' }) {
  return (
    <header className="site-header">
      <div className="page">
        <Link to="/" className="brand">
          MTOGO
        </Link>
        {variant === 'marketing' && <span className="link-quiet">København K ▾</span>}
        <nav>
          <Link to="/">Restauranter</Link>
          {variant === 'marketing' ? (
            <>
              <a href="#saadan-fungerer-det">Sådan fungerer det</a>
              <Link to="/login" style={{ fontWeight: 600 }}>
                Log ind
              </Link>
              <Link to="/opret-konto" className="btn btn-primary">
                Opret konto
              </Link>
            </>
          ) : (
            <>
              <Link to="/ansoeg/restaurant">Bliv partner</Link>
              <Link to="/min-profil">Min profil</Link>
              <Link to="/betaling" style={{ fontWeight: 600 }}>
                Kurv · 2
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
