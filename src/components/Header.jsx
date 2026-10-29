import { Bell, Search, Menu } from "lucide-react";

export default function Header({ title, subtitle, onMenuClick }) {
  return (
    <header className="topbar">
      <div className="page-heading">
        <button
          className="mobile-menu icon-button"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="header-actions">
        <label className="search-box">
          <Search size={17} />
          <input placeholder="Search..." aria-label="Search" />
          <kbd>⌘ K</kbd>
        </label>

        <button className="icon-button notification-button" aria-label="Notifications">
          <Bell size={19} />
          <span className="notification-dot" />
        </button>

        <div className="avatar header-avatar">HR</div>
      </div>
    </header>
  );
}s