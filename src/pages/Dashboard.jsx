import { Link } from "react-router-dom";
import api from "../services/api";
import {
  Users,
  UserPlus,
  LogOut,
  CheckSquare,
  ArrowUpRight,
  CalendarDays,
  Clock3,
} from "lucide-react";
import StatusBadge from "../components/StatusBadge";

const stats = [
  { label: "Total Employees", value: "248", note: "+12 this month", icon: Users, color: "purple" },
  { label: "New Onboarding", value: "08", note: "3 need attention", icon: UserPlus, color: "blue" },
  { label: "Pending Exits", value: "04", note: "2 this week", icon: LogOut, color: "orange" },
  { label: "Open Tasks", value: "16", note: "6 due this week", icon: CheckSquare, color: "green" },
];

const activities = [
  { name: "Priya Sharma", action: "completed onboarding", time: "10 minutes ago", status: "Completed" },
  { name: "Arjun Patel", action: "submitted a resignation", time: "1 hour ago", status: "Pending" },
  { name: "Meera Reddy", action: "completed assigned tasks", time: "3 hours ago", status: "Completed" },
  { name: "Rahul Verma", action: "requested feedback", time: "Yesterday", status: "Under Review" },
];

export default function Dashboard() {
  return (
    <>
      <section className="welcome-panel">
        <div>
          <span className="eyebrow">HR OVERVIEW</span>
          <h2>Good morning, HR Team 👋</h2>
          <p>Here's what's happening across your organization today.</p>
        </div>
        <div className="welcome-date">
          <CalendarDays size={17} />
          {new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </div>
      </section>

      <section className="stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <article className="stat-card" key={stat.label}>
              <div className="stat-top">
                <div className={`stat-icon ${stat.color}`}><Icon size={21} /></div>
                <ArrowUpRight size={18} className="muted-icon" />
              </div>
              <p className="stat-label">{stat.label}</p>
              <h3>{stat.value}</h3>
              <p className="stat-note">{stat.note}</p>
            </article>
          );
        })}
      </section>

      <section className="dashboard-grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <h3>Recent Activity</h3>
              <p>Latest updates from your workforce</p>
            </div>
            <Clock3 size={19} className="muted-icon" />
          </div>

          <div className="activity-list">
            {activities.map((item) => (
              <div className="activity-row" key={item.name}>
                <div className="avatar activity-avatar">
                  {item.name.split(" ").map((part) => part[0]).join("")}
                </div>
                <div className="activity-copy">
                  <strong>{item.name}</strong>
                  <p>{item.action}</p>
                  <span>{item.time}</span>
                </div>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
        </article>

        <article className="panel quick-panel">
          <div className="panel-heading">
            <div>
              <h3>Quick Actions</h3>
              <p>Shortcuts to common HR tasks</p>
            </div>
          </div>

          <Link className="quick-link" to="/onboarding">
            <span className="quick-icon blue"><UserPlus size={19} /></span>
            <span><strong>Start onboarding</strong><small>Add a new employee</small></span>
            <ArrowUpRight size={17} />
          </Link>

          <Link className="quick-link" to="/announcements">
            <span className="quick-icon purple"><CalendarDays size={19} /></span>
            <span><strong>Publish announcement</strong><small>Share an update</small></span>
            <ArrowUpRight size={17} />
          </Link>

          <Link className="quick-link" to="/tasks">
            <span className="quick-icon green"><CheckSquare size={19} /></span>
            <span><strong>Manage tasks</strong><small>Review team assignments</small></span>
            <ArrowUpRight size={17} />
          </Link>

          <Link className="quick-link" to="/feedback">
            <span className="quick-icon orange"><Users size={19} /></span>
            <span><strong>Collect feedback</strong><small>View employee feedback</small></span>
            <ArrowUpRight size={17} />
          </Link>
        </article>
      </section>
    </>
  );
}