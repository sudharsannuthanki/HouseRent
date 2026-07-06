// Dark navy hero-style banner used at the top of key dashboard pages,
// matching the "Landlord Command Hub" style header.
function HeroBanner({ eyebrow, title, subtitle, action }) {
  return (
    <div className="hero-banner">
      <div>
        {eyebrow && <p className="hero-eyebrow">&#10022; {eyebrow}</p>}
        <h2 className="hero-title">{title}</h2>
        {subtitle && <p className="hero-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="hero-action">{action}</div>}
    </div>
  );
}

export default HeroBanner;
