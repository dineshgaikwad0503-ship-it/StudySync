import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api.js";
import FileDrive from "../components/FileDrive.jsx";
import QuizBuilder from "../components/QuizBuilder.jsx";
import Leaderboard from "../components/Leaderboard.jsx";

export default function GroupPage() {
  const { groupId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api(`/groups/${groupId}`).then(setData).catch((e) => setError(e.message));
  }, [groupId]);

  if (error) return <div className="center"><p className="error">{error}</p></div>;
  if (!data) return <div className="center muted">Loading group…</div>;

  const { group, role } = data;
  const inviteLink = `${window.location.origin}/join/${group.inviteCode}`;

  return (
    <main className="page">
      <div className="row between">
        <div>
          <span className="tag">{group.subject || "General"}</span>
          <h1>{group.name}</h1>
          <p className="muted">{group.description}</p>
        </div>
        <Link className="btn" to={`/groups/${groupId}/room`}>Enter study room →</Link>
      </div>

      <section className="card">
        <h3>Invite link</h3>
        <div className="row">
          <code className="invite">{inviteLink}</code>
          <button className="secondary" onClick={() => navigator.clipboard.writeText(inviteLink)}>Copy</button>
        </div>
        <p className="muted small">Anyone with this link can join {group.name}.</p>
      </section>

      <section className="grid two">
        <div className="card">
          <h3>Members</h3>
          <ul className="members">
            {group.members.map((m) => (
              <li key={m.user._id}>
                <span className="avatar">{m.user.name[0]}</span>
                {m.user.name} {m.role === "owner" && <em className="tag small">owner</em>}
              </li>
            ))}
          </ul>
        </div>
        <Leaderboard groupId={groupId} />
      </section>

      <FileDrive groupId={groupId} />
      <QuizBuilder groupId={groupId} canCreate={Boolean(role)} />
    </main>
  );
}
