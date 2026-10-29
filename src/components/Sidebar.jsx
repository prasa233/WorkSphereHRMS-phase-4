import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  UserPlus,
  LogOut,
  Megaphone,
  CheckSquare,
  Plug,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/onboarding", label: "Onboarding", icon: UserPlus },
  { to: "/resignations", label: "Resignations", icon: LogOut },
  { to: "/announcements", label: "Announcements", icon: Megaphone },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/integrations", label: "Integrations", icon: Plug },
  { to: "/feedback", label: "Feedback", icon: MessageSquare },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon"><Users size={23} /></div>
        <div>
          <strong>WorkSphere</strong>
          <span>HR MANAGEMENT</span>
        </div>
      </div>

      <div className="nav-caption">WORKSPACE</div>
      <nav className="navigation">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="help-card">
          <div className="help-icon">?</div>
          <strong>Need help?</strong>
          <p>Contact your HR administrator for support.</p>
        </div>
        <div className="sidebar-user">
          <div className="avatar">HR</div>
          <div>
            <strong>HR Administrator</strong>
            <span>Administrator</span>
          </div>
        </div>
      </div>
    </aside>
  );
}