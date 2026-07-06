import { IconRefresh } from "./Icons";

// White card header used on list pages, with an optional "Refresh" action -
// matches the "Property Offer & Negotiation Board" style header.
function PageHeaderCard({ title, subtitle, onRefresh }) {
  return (
    <div className="card page-header-card">
      <div>
        <h2 className="page-header-title">{title}</h2>
        {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
      </div>
      {onRefresh && (
        <button className="refresh-link" onClick={onRefresh} type="button">
          <IconRefresh size={13} /> Refresh
        </button>
      )}
    </div>
  );
}

export default PageHeaderCard;
