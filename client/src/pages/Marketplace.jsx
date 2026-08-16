import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";

export default function Marketplace() {
  const [tutors, setTutors] = useState([]);
  const [subject, setSubject] = useState("");
  const [maxRate, setMaxRate] = useState("");

  useEffect(() => {
    const qs = new URLSearchParams();
    if (subject) qs.set("subject", subject);
    if (maxRate) qs.set("maxRate", maxRate);
    api(`/tutors?${qs}`).then(setTutors).catch(() => {});
  }, [subject, maxRate]);

  return (
    <main className="page">
      <h1>Tutor marketplace</h1>
      <p className="muted">Verified tutors, hourly rates, instant booking.</p>

      <div className="row filters">
        <input placeholder="Filter by subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <input type="number" placeholder="Max $/hr" value={maxRate} onChange={(e) => setMaxRate(e.target.value)} />
      </div>

      {tutors.length === 0 ? (
        <p className="muted">No tutors match that search yet.</p>
      ) : (
        <section className="grid three">
          {tutors.map((t) => (
            <article key={t._id} className="card">
              <span className="avatar big">{t.user?.name?.[0]}</span>
              <h3>{t.user?.name}</h3>
              <p className="muted">{t.headline}</p>
              <div className="row wrap">
                {t.subjects?.map((s) => <span key={s} className="tag small">{s}</span>)}
              </div>
              <p className="price">${t.hourlyRate}/hr</p>
              <Link className="btn" to={`/tutors/${t._id}`}>View & book</Link>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
