import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    navigate('/');
  }

  return (
    <AuthLayout>
      <div>
        <p className="eyebrow">Velkommen tilbage</p>
        <h1>Godt at se dig igen.</h1>
      </div>
      <p className="lead">Log ind, og find noget, du har lyst til.</p>

      <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
        <div className="field">
          <label htmlFor="login-email">E-mail</label>
          <input id="login-email" type="email" placeholder="din@email.dk" />
        </div>

        <div className="field">
          <label htmlFor="login-password">Adgangskode</label>
          <div className="input-affix">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Indtast din adgangskode"
              style={{ width: '100%' }}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? 'Skjul' : 'Vis'}
            </button>
          </div>
        </div>

        <div className="auth-row">
          <label className="checkbox">
            <input type="checkbox" />
            Husk mig
          </label>
          <Link to="/glemt-adgangskode" className="link-accent" style={{ fontSize: 13 }}>
            Glemt adgangskode?
          </Link>
        </div>

        <button type="submit" className="btn btn-primary btn-block">
          Log ind
        </button>
      </form>

      <p className="auth-switch">
        Ny hos MTOGO?{' '}
        <Link to="/opret-konto" className="link-accent">
          Opret en konto
        </Link>
      </p>
    </AuthLayout>
  );
}
