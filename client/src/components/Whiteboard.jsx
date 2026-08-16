import { useEffect, useRef, useState } from "react";

/**
 * Collaborative whiteboard.
 *
 * Local drawing is immediate; each segment is normalised to 0..1 and batched
 * over Socket.io (`wb:stroke` / `wb:strokes`) so peers replay the exact same
 * moveTo/lineTo path at their own canvas size.
 */
export default function Whiteboard({ socket, groupId }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef(null);
  const buffer = useRef([]);
  const [color, setColor] = useState("#111827");
  const [width, setWidth] = useState(3);
  const [erase, setErase] = useState(false);

  /** Draw one normalised segment onto the canvas. */
  function paint(stroke) {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = stroke.erase ? "#ffffff" : stroke.color;
    ctx.lineWidth = stroke.erase ? stroke.width * 6 : stroke.width;
    ctx.beginPath();
    ctx.moveTo(stroke.from.x * canvas.width, stroke.from.y * canvas.height);
    ctx.lineTo(stroke.to.x * canvas.width, stroke.to.y * canvas.height);
    ctx.stroke();
  }

  function clearLocal() {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  }

  // Size the canvas to its container (device-pixel aware) and replay history.
  useEffect(() => {
    const canvas = canvasRef.current;
    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      const snapshot = canvas.toDataURL();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = 520 * window.devicePixelRatio;
      canvas.style.height = "520px";
      const img = new Image();
      img.onload = () => canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      img.src = snapshot;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Incoming events from other clients.
  useEffect(() => {
    if (!socket) return;
    socket.emit("wb:sync", groupId, (res) => {
      if (res?.ok) res.strokes.forEach(paint);
    });
    const onStroke = (s) => paint(s);
    const onStrokes = (list) => list.forEach(paint);
    const onClear = () => clearLocal();

    socket.on("wb:stroke", onStroke);
    socket.on("wb:strokes", onStrokes);
    socket.on("wb:clear", onClear);
    return () => {
      socket.off("wb:stroke", onStroke);
      socket.off("wb:strokes", onStrokes);
      socket.off("wb:clear", onClear);
    };
  }, [socket, groupId]);

  // Flush buffered segments ~20x/second instead of one emit per mousemove.
  useEffect(() => {
    const id = setInterval(() => {
      if (!buffer.current.length) return;
      socket?.emit("wb:strokes", { groupId, strokes: buffer.current });
      buffer.current = [];
    }, 50);
    return () => clearInterval(id);
  }, [socket, groupId]);

  function pos(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const point = e.touches?.[0] ?? e;
    return {
      x: (point.clientX - rect.left) / rect.width,
      y: (point.clientY - rect.top) / rect.height,
    };
  }

  function start(e) {
    drawing.current = true;
    last.current = pos(e);
  }

  function move(e) {
    if (!drawing.current) return;
    e.preventDefault();
    const to = pos(e);
    const stroke = { from: last.current, to, color, width, erase };
    paint(stroke);            // instant local feedback
    buffer.current.push(stroke); // broadcast on the next flush
    last.current = to;
  }

  function stop() {
    drawing.current = false;
    last.current = null;
  }

  return (
    <div className="card whiteboard">
      <div className="row between">
        <h3>Whiteboard</h3>
        <div className="row tools">
          {["#111827", "#ef4444", "#2563eb", "#16a34a", "#f59e0b"].map((c) => (
            <button key={c} aria-label={`colour ${c}`} className={`swatch${color === c && !erase ? " on" : ""}`}
              style={{ background: c }} onClick={() => { setColor(c); setErase(false); }} />
          ))}
          <input type="range" min="1" max="20" value={width} onChange={(e) => setWidth(+e.target.value)} />
          <button className={`secondary${erase ? " on" : ""}`} onClick={() => setErase(!erase)}>Eraser</button>
          <button className="ghost" onClick={() => { clearLocal(); socket?.emit("wb:clear", { groupId }); }}>
            Clear
          </button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="canvas"
        onMouseDown={start} onMouseMove={move} onMouseUp={stop} onMouseLeave={stop}
        onTouchStart={start} onTouchMove={move} onTouchEnd={stop}
      />
    </div>
  );
}
