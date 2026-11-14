import { Link } from 'react-router-dom';

export default function AuthLayout({ children }) {
  return (
    <div className="auth">
      <aside className="auth-aside">
        <div
          className="photo"
          style={{ backgroundImage: 'url(/images/auth-pizza.png)' }}
        />
        <div className="auth-logo">MTOGO</div>
        <div className="text">
          <p className="eyebrow eyebrow-light">God mad. Godt nabolag.</p>
          <h2>
            Mere smag.
            <br />
            Mindre hverdag.
          </h2>
          <p>
            Opdag lokale favoritter, og få dit næste
            <br />
            gode måltid leveret lige til døren.
          </p>
          <p className="footnote">Lavet lokalt. Nydt hjemme.</p>
        </div>
      </aside>
      <main className="auth-main">
        <Link to="/" className="link-quiet">
          ← Tilbage til restauranter
        </Link>
        <div className="auth-form">{children}</div>
      </main>
    </div>
  );
}
