import { useState } from "react";
import { Save, UserRound, ShieldCheck, BellRing } from "lucide-react";

export default function Settings() {
  const [profile, setProfile] = useState({
    name: "HR Administrator",
    email: "hr@example.com",
    department: "Human Resources",
    timezone: "Asia/Kolkata",
  });

  const [notifications, setNotifications] = useState({
    email: true,
    onboarding: true,
    tasks: false,
    announcements: true,
  });

  const [message, setMessage] = useState("");

  function saveProfile(event) {
    event.preventDefault();
    setMessage("Profile updated in this demo. Connect the settings API to persist changes.");
  }

  return (
    <div className="settings-layout">
      <section className="panel settings-panel">
        <div className="settings-section-heading">
          <div className="settings-icon"><UserRound size={21} /></div>
          <div><h3>Profile information</h3><p>Manage your account details and preferences.</p></div>
        </div>

        <form onSubmit={saveProfile}>
          <div className="profile-preview">
            <div className="avatar profile-avatar">HR</div>
            <div><strong>{profile.name}</strong><p>{profile.email}</p></div>
          </div>

          <div className="form-grid">
            <label>Full name<input required value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></label>
            <label>Email address<input required type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></label>
            <label>Department<input value={profile.department} onChange={(e) => setProfile({ ...profile, department: e.target.value })} /></label>
            <label>Time zone<select value={profile.timezone} onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}><option value="Asia/Kolkata">India Standard Time (IST)</option><option value="UTC">UTC</option><option value="America/New_York">Eastern Time</option><option value="Europe/London">London</option></select></label>
          </div>

          <div className="form-actions">
            <button className="primary-button"><Save size={16} /> Save profile</button>
          </div>
        </form>
      </section>

      <section className="panel settings-panel">
        <div className="settings-section-heading">
          <div className="settings-icon"><BellRing size={21} /></div>
          <div><h3>Notification preferences</h3><p>Choose which notifications you want to receive.</p></div>
        </div>

        <div className="settings-options">
          {[
            ["email", "Email notifications", "Receive important HR updates by email."],
            ["onboarding", "Onboarding updates", "Get notified when onboarding status changes."],
            ["tasks", "Task reminders", "Receive reminders for assigned tasks."],
            ["announcements", "Company announcements", "Stay informed about company news."],
          ].map(([key, title, description]) => (
            <label className="toggle-row" key={key}>
              <span><strong>{title}</strong><small>{description}</small></span>
              <input type="checkbox" checked={notifications[key]} onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })} />
            </label>
          ))}
        </div>
      </section>

      <section className="panel settings-panel security-panel">
        <div className="settings-section-heading">
          <div className="settings-icon"><ShieldCheck size={21} /></div>
          <div><h3>Security</h3><p>Account access and protection.</p></div>
        </div>
        <div className="security-notice">
          <ShieldCheck size={19} />
          <div><strong>Authentication is managed by the backend</strong><p>Use secure login, server-validated JWTs, role-based access control, and HTTPS for production.</p></div>
        </div>
      </section>

      {message && <div className="inline-message" role="status">{message}</div>}
    </div>
  );
}