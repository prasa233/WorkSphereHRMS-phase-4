import { useEffect, useState } from "react";
import api from "../api";
import Layout from "../components/Layout";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/employees/me")
      .then((res) => setProfile(res.data))
      .catch((err) => setError(
        err.response?.data?.detail || "Unable to load profile."
      ));
  }, []);

  return (
    <Layout>
      <h1>My Profile</h1>

      {error && <p className="error">{error}</p>}
      {!profile && !error && <p>Loading profile...</p>}

      {profile && (
        <section className="welcome-card">
          <h2>{profile.full_name}</h2>
          <p>Employee ID: {profile.id}</p>
          <p>Department: {profile.department || "Not assigned"}</p>
          <p>Designation: {profile.designation || "Not assigned"}</p>
          <p>Joining date: {profile.joining_date || "Not recorded"}</p>
        </section>
      )}
    </Layout>
  );
}