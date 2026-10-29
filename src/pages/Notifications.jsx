
import { useCallback, useEffect, useState } from "react";
import { Bell, CheckCheck, RefreshCw } from "lucide-react";
import api, { getErrorMessage } from "../api/client";

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    try {
      const response = await api.get("/notifications");

      setItems(
        Array.isArray(response.data)
          ? response.data
          : response.data.items || []
      );

      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();

    const interval = setInterval(loadNotifications, 30000);

    return () => clearInterval(interval);
  }, [loadNotifications]);

  async function markRead(item) {
    try {
      await api.patch(`/notifications/${item.id}/read`);

      setItems((current) =>
        current.map((notification) =>
          notification.id === item.id
            ? { ...notification, is_read: true, read: true }
            : notification
        )
      );
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function markAllRead() {
    const unread = items.filter(
      (item) => !(item.is_read ?? item.read ?? false)
    );

    try {
      await Promise.all(
        unread.map((item) =>
          api.patch(`/notifications/${item.id}/read`)
        )
      );

      await loadNotifications();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const unreadCount = items.filter(
    (item) => !(item.is_read ?? item.read ?? false)
  ).length;

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">MODULE 19</span>
          <h1>Notifications</h1>
          <p>
            Alerts for attendance, leave approvals, payroll,
            and documents.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={loadNotifications}
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Inbox</h2>
            <p>
              {unreadCount} unread · Refreshes every 30 seconds
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={markAllRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck size={15} /> Mark all read
          </button>
        </div>

        <div className="notification-list">
          {items.map((item, index) => {
            const isRead = item.is_read ?? item.read ?? false;

            return (
              <article
                key={item.id || index}
                className={`notification-row ${isRead ? "read" : ""}`}
              >
                <div className="notification-icon">
                  <Bell size={18} />
                </div>

                <div className="notification-body">
                  <div className="notification-title">
                    <b>
                      {item.title ||
                        item.subject ||
                        item.type ||
                        "Notification"}
                    </b>
                    {!isRead && <span className="unread-dot" />}
                  </div>

                  <p>
                    {item.message ||
                      item.body ||
                      item.description ||
                      "No additional details."}
                  </p>

                  <small>
                    {item.created_at
                      ? new Date(item.created_at).toLocaleString()
                      : "Time unavailable"}
                  </small>
                </div>

                {!isRead && (
                  <button
                    className="text-button"
                    onClick={() => markRead(item)}
                  >
                    Mark read
                  </button>
                )}
              </article>
            );
          })}

          {!loading && !items.length && (
            <div className="empty-state">
              No notifications found.
            </div>
          )}
        </div>
      </section>

      <p className="helper-text">
        This example polls the API every 30 seconds. For true
        real-time updates, use WebSockets or server-sent events.
        The backend must generate notifications when relevant
        HR events occur.
      </p>
    </>
  );
}