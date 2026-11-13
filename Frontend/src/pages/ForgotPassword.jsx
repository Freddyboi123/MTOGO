import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';

export default function ForgotPassword() {
  return (
    <AuthLayout>
      <div>
        <p className="eyebrow">Vi hjælper dig ind igen</p>
        <h1>Glemt adgangskoden?</h1>
      </div>
      <p className="lead">
        Indtast din e-mail, så sender vi dig et link til
        <br />
        at vælge en ny adgangskode.
      </p>

      <form onSubmit={(event) => event.preventDefault()} style={{ display: 'contents' }}>
        <div className="field">
          <label htmlFor="reset-email">E-mail</label>
          <input id="reset-email" type="email" placeholder="din@email.dk" />
        </div>

        <button type="submit" className="btn btn-primary btn-block">
          Send nulstillingslink
        </button>
      </form>

      <p className="field-hint">Tjek også din spam-mappe, hvis mailen ikke dukker op.</p>

      <p className="auth-switch">
        <Link to="/login" className="link-quiet">
          ← Tilbage til login
        </Link>
      </p>
    </AuthLayout>
  );
}
