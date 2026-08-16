import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api.js";

export default function TutorPage() {
  const { tutorId } = useParams();
  const [tutor, setTutor] = useState(null);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { api(`/tutors/${tutorId}`).then(setTutor).catch((e) => setError(e.message)); }, [tutorId]);

  const loadSlots = () =>
    api(`/bookings/availability/${tutorId}?date=${date}`).then(setSlots).catch(() => setSlots([]));
  useEffect(() => { loadSlots(); }, [tutorId, date]); // eslint-disable-line

  async function book(startsAt) {
    setError(""); setMessage("");
    try {
      await api("/bookings", { method: "POST", body: { tutorId, startsAt } });
      setMessage("Booked! Check your email for the session link.");
      loadSlots();
    } catch (err) { setError(err.message); loadSlots(); }
  }

  if (error && !tutor) return <div className="center"><p className="error">{error}</p></div>;
  if (!tutor) return <div className="center muted">Loading tutor…</div>;

  return (
    <main className="page narrow">
      <span className="avatar big">{tutor.user?.name?.[0]}</span>
      <h1>{tutor.user?.name}</h1>
      <p className="muted">{tutor.headline}</p>
      <p>{tutor.bio}</p>
      <p className="price">${tutor.hourlyRate}/hr · 60 min sessions</p>

      <div className="card">
        <h3>Pick a slot</h3>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        {message && <p className="ok-msg">{message}</p>}
        {error && <p className="error">{error}</p>}
        <div className="row wrap slots">
          {slots.length === 0 && <p className="muted">No free slots on this day.</p>}
          {slots.map((s) => (
            <button key={s} className="secondary" onClick={() => book(s)}>
              {new Date(s).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </button>
          ))}
        </div>
        <p className="muted small">Slots already booked disappear — the server rejects double-bookings.</p>
      </div>
    </main>
  );
}
