import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    navigate('/login');
  }

  return (
    <AuthLayout>
      <div>
        <p className="eyebrow">En verden af lokale favoritter</p>
        <h1>Din næste livret venter.</h1>
      </div>
      <p className="lead">Opret en konto, og få god smag tættere på.</p>

      <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
        <div className="field">
          <label htmlFor="signup-name">Fulde navn</label>
          <input id="signup-name" placeholder="Dit for- og efternavn" />
        </div>

        <div className="field">
          <label htmlFor="signup-email">E-mail</label>
          <input id="signup-email" type="email" placeholder="din@email.dk" />
        </div>

        <div className="field">
          <label htmlFor="signup-password">Adgangskode</label>
          <div className="input-affix">
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Vælg en sikker adgangskode"
              style={{ width: '100%' }}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? 'Skjul' : 'Vis'}
            </button>
          </div>
          <span className="field-hint">Brug mindst 8 tegn.</span>
        </div>

        <label className="checkbox">
          <input type="checkbox" />
          Jeg accepterer handelsbetingelserne og har læst privatlivspolitikken.
        </label>

        <button type="submit" className="btn btn-primary btn-block">
          Opret konto
        </button>
      </form>

      <p className="auth-switch">
        Har du allerede en konto?{' '}
        <Link to="/login" className="link-accent">
          Log ind
        </Link>
      </p>
    </AuthLayout>
  );
}
