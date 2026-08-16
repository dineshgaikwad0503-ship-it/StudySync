import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState({ name: "", subject: "" });
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const load = () => api("/groups").then(setGroups).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  async function createGroup(e) {
    e.preventDefault();
    try {
      await api("/groups", { method: "POST", body: form });
      setForm({ name: "", subject: "" });
      load();
    } catch (err) { setError(err.message); }
  }

  async function joinGroup(e) {
    e.preventDefault();
    try {
      await api(`/groups/join/${code.trim().toUpperCase()}`, { method: "POST" });
      setCode(""); load();
    } catch (err) { setError(err.message); }
  }

  return (
    <main className="page">
      <h1>Hi {user?.name?.split(" ")[0]} 👋</h1>
      <p className="muted">Your study groups, resources and rooms.</p>
      {error && <p className="error">{error}</p>}

      <section className="grid two">
        <form className="card" onSubmit={createGroup}>
          <h3>Create a group</h3>
          <input placeholder='Group name e.g. "Calculus 101"' value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="Subject" value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <button>Create group</button>
        </form>
        <form className="card" onSubmit={joinGroup}>
          <h3>Join with an invite code</h3>
          <input placeholder="e.g. CALC1010" value={code} onChange={(e) => setCode(e.target.value)} required />
          <button className="secondary">Join group</button>
        </form>
      </section>

      <h2>Your groups</h2>
      {groups.length === 0 && <p className="muted">No groups yet — create one above.</p>}
      <section className="grid three">
        {groups.map((g) => (
          <article key={g._id} className="card group-card">
            <span className="tag">{g.subject || "General"}</span>
            <h3>{g.name}</h3>
            <p className="muted">{g.members.length} member{g.members.length === 1 ? "" : "s"}</p>
            <div className="row">
              <Link className="btn" to={`/groups/${g._id}`}>Open</Link>
              <Link className="btn secondary" to={`/groups/${g._id}/room`}>Study room</Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
