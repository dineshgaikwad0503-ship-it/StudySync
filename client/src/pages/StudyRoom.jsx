import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getSocket } from "../lib/socket.js";
import Whiteboard from "../components/Whiteboard.jsx";
import Chat from "../components/Chat.jsx";
import VideoPanel from "../components/VideoPanel.jsx";

export default function StudyRoom() {
  const { groupId } = useParams();
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState("Connecting…");
  const [people, setPeople] = useState([]);

  useEffect(() => {
    const s = getSocket();
    setSocket(s);

    const join = () =>
      s.emit("room:join", groupId, (res) => {
        setStatus(res?.ok ? `Live in ${res.room}` : res?.message || "Could not join");
        if (res?.ok) s.emit("presence:who", groupId, setPeople);
      });

    s.connected ? join() : s.once("connect", join);
    const refresh = () => s.emit("presence:who", groupId, setPeople);
    s.on("presence:joined", refresh);
    s.on("presence:left", refresh);

    return () => {
      s.emit("room:leave", groupId);
      s.off("presence:joined", refresh);
      s.off("presence:left", refresh);
    };
  }, [groupId]);

  return (
    <main className="page room">
      <div className="row between">
        <div>
          <h1>Study room</h1>
          <p className="muted"><span className="dot" /> {status}</p>
        </div>
        <div className="row">
          <div className="people">
            {people.map((p) => <span key={p.id} className="avatar" title={p.name}>{p.name[0]}</span>)}
          </div>
          <Link className="btn secondary" to={`/groups/${groupId}`}>Back to group</Link>
        </div>
      </div>

      <div className="room-grid">
        <Whiteboard socket={socket} groupId={groupId} />
        <div className="stack">
          <Chat socket={socket} groupId={groupId} />
          <VideoPanel socket={socket} groupId={groupId} />
        </div>
      </div>
    </main>
  );
}
