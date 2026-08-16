import { useEffect, useRef, useState } from "react";

/**
 * Optional video layer using PeerJS (WebRTC).
 * Signalling piggybacks on our Socket.io room: each peer announces its PeerJS
 * id with `video:register`, and existing peers call the newcomer.
 * Swap in Agora/Daily.co here without touching the server.
 */
export default function VideoPanel({ socket, groupId }) {
  const localRef = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);
  const [remotes, setRemotes] = useState([]);
  const [on, setOn] = useState(false);
  const [error, setError] = useState("");

  async function startCall() {
    try {
      const { default: Peer } = await import("peerjs");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (localRef.current) localRef.current.srcObject = stream;

      const peer = new Peer();
      peerRef.current = peer;

      peer.on("open", (peerId) => {
        socket.emit("video:register", { groupId, peerId });
        socket.emit("presence:who", groupId, (people) => {
          people
            .filter((p) => p.peerId && p.peerId !== peerId)
            .forEach((p) => connectTo(peer, p.peerId, stream, p.name));
        });
      });

      peer.on("call", (call) => {
        call.answer(stream);
        call.on("stream", (remote) => addRemote(call.peer, remote));
      });

      socket.on("video:peer-joined", ({ peerId, user }) => {
        if (peerId && peerId !== peer.id) connectTo(peer, peerId, stream, user.name);
      });
      socket.on("video:peer-left", ({ peerId }) =>
        setRemotes((r) => r.filter((x) => x.id !== peerId))
      );

      setOn(true);
    } catch (err) {
      setError(err.message);
    }
  }

  function connectTo(peer, peerId, stream, name) {
    const call = peer.call(peerId, stream);
    call?.on("stream", (remote) => addRemote(peerId, remote, name));
  }

  function addRemote(id, stream, name) {
    setRemotes((prev) => (prev.some((r) => r.id === id) ? prev : [...prev, { id, stream, name }]));
  }

  function stopCall() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    peerRef.current?.destroy();
    socket.emit("video:leave", { groupId });
    setRemotes([]); setOn(false);
  }

  useEffect(() => () => { if (on) stopCall(); }, []); // eslint-disable-line

  return (
    <div className="card">
      <div className="row between">
        <h3>Video</h3>
        <button className={on ? "ghost" : "secondary"} onClick={on ? stopCall : startCall}>
          {on ? "Leave call" : "Join call"}
        </button>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="videos">
        <video ref={localRef} autoPlay playsInline muted />
        {remotes.map((r) => <RemoteVideo key={r.id} stream={r.stream} />)}
      </div>
      {!on && <p className="muted small">Optional WebRTC layer (PeerJS). Camera stays off until you join.</p>}
    </div>
  );
}

function RemoteVideo({ stream }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.srcObject = stream; }, [stream]);
  return <video ref={ref} autoPlay playsInline />;
}
