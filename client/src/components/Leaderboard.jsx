import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

export default function Leaderboard({ groupId, socket }) {
  const [rows, setRows] = useState([]);

  const load = () => api(`/quizzes/${groupId}/leaderboard`).then(setRows).catch(() => {});
  useEffect(() => { load(); }, [groupId]);

  useEffect(() => {
    if (!socket) return;
    const onBoard = () => load();
    socket.on("quiz:leaderboard", onBoard);
    return () => socket.off("quiz:leaderboard", onBoard);
  }, [socket]); // eslint-disable-line

  return (
    <div className="card">
      <h3>Leaderboard</h3>
      {rows.length === 0 ? (
        <p className="muted">Take a quiz to get on the board.</p>
      ) : (
        <ol className="board">
          {rows.map((r, i) => (
            <li key={r._id}>
              <span className="rank">{i + 1}</span>
              <span>{r.user.name}</span>
              <strong>{r.points} pts</strong>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
