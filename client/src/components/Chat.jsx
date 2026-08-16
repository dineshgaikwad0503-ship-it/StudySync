import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Chat({ socket, groupId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(null);
  const endRef = useRef(null);

  useEffect(() => {
    api(`/groups/${groupId}/messages`).then(setMessages).catch(() => {});
  }, [groupId]);

  useEffect(() => {
    if (!socket) return;
    const onMessage = (m) => setMessages((prev) => [...prev, m]);
    const onTyping = ({ user: u, typing: t }) => setTyping(t ? u.name : null);
    socket.on("chat:message", onMessage);
    socket.on("chat:typing", onTyping);
    return () => {
      socket.off("chat:message", onMessage);
      socket.off("chat:typing", onTyping);
    };
  }, [socket]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function send(e) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    socket.emit("chat:send", { groupId, body });
    socket.emit("chat:typing", { groupId, typing: false });
    setText("");
  }

  return (
    <div className="card chat">
      <h3>Live chat</h3>
      <div className="messages">
        {messages.map((m) => (
          <div key={m._id} className={`msg${m.sender?._id === user?.id ? " mine" : ""}`}>
            <span className="who">{m.sender?.name}</span>
            <p>{m.body}</p>
            <time>{new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      {typing && <p className="muted small">{typing} is typing…</p>}
      <form className="row" onSubmit={send}>
        <input value={text} placeholder="Message the group…"
          onChange={(e) => { setText(e.target.value); socket?.emit("chat:typing", { groupId, typing: true }); }} />
        <button>Send</button>
      </form>
    </div>
  );
}
