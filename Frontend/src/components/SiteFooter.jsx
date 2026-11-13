export default function SiteFooter({ variant = 'full' }) {
  if (variant === 'slim') {
    return (
      <footer className="site-footer site-footer-slim">
        <div className="page">
          <span>© 2026 MTOGO</span>
          <span>Hjælp &amp; kontakt     Privatliv     Handelsbetingelser</span>
        </div>
      </footer>
    );
  }

  return (
    <footer className="site-footer">
      <div className="page">
        <div>
          <div className="brand">MTOGO</div>
          <p className="footer-sub">Gode måltider. Tættere på.</p>
          <p className="footer-sub">© 2026 MTOGO Alle rettigheder forbeholdes.</p>
        </div>
        <div>
          <div className="footer-links">
            <a href="#om">Om MTOGO</a>
            <a href="#hjaelp">Hjælp &amp; kontakt</a>
            <a href="#partner">Bliv partner</a>
          </div>
          <div className="footer-links footer-sub" style={{ marginTop: 20 }}>
            <a href="#privatliv">Privatliv</a>
            <a href="#betingelser">Handelsbetingelser</a>
            <a href="#cookies">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
