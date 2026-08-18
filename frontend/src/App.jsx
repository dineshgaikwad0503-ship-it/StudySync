import React,{useEffect,useRef,useState} from "react";
import {io} from "socket.io-client";

const socket=io(import.meta.env.VITE_SOCKET_URL||"http://localhost:4000",{autoConnect:true});

export default function App(){
 const canvasRef=useRef(null), [room,setRoom]=useState("calculus-101"), [msg,setMsg]=useState(""), [messages,setMessages]=useState([]);
 useEffect(()=>{
   socket.emit("room:join",{roomId:room,userId:"demo-user"});
   const onChat=m=>setMessages(x=>[...x,m]);
   const onDraw=d=>draw(d,false);
   socket.on("chat:message",onChat); socket.on("whiteboard:draw",onDraw);
   return()=>{socket.off("chat:message",onChat);socket.off("whiteboard:draw",onDraw)};
 },[room]);
 function draw({x0,y0,x1,y1},emit=true){
   const c=canvasRef.current,ctx=c.getContext("2d");ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();
   if(emit) socket.emit("whiteboard:draw",{roomId:room,x0,y0,x1,y1});
 }
 function down(e){const r=canvasRef.current.getBoundingClientRect();canvasRef.current.dataset.drawing="1";canvasRef.current.dataset.x=e.clientX-r.left;canvasRef.current.dataset.y=e.clientY-r.top}
 function move(e){if(canvasRef.current.dataset.drawing!=="1")return;const r=canvasRef.current.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;draw({x0:+canvasRef.current.dataset.x,y0:+canvasRef.current.dataset.y,x1:x,y1:y});canvasRef.current.dataset.x=x;canvasRef.current.dataset.y=y}
 function send(){if(!msg.trim())return;socket.emit("chat:message",{roomId:room,user:"Student",text:msg});setMsg("")}
 return <div className="container-fluid py-4"><header className="mb-4"><h1>StudySync</h1><p>Real-time collaborative learning workspace</p></header>
 <div className="row g-4"><aside className="col-lg-3"><div className="card p-3"><h5>Study Group</h5><input className="form-control mb-2" value={room} onChange={e=>setRoom(e.target.value)}/><p className="small text-muted">Invite link: /join/{room}</p><hr/><h6>Resources</h6><button className="btn btn-outline-primary w-100">Upload PDF</button></div></aside>
 <main className="col-lg-6"><div className="card p-3"><h4>Collaborative Whiteboard</h4><canvas ref={canvasRef} width="700" height="420" onMouseDown={down} onMouseMove={move} onMouseUp={()=>canvasRef.current.dataset.drawing="0"} onMouseLeave={()=>canvasRef.current.dataset.drawing="0"} /></div></main>
 <aside className="col-lg-3"><div className="card p-3"><h5>Live Chat</h5><div className="chat-box mb-2">{messages.map((m,i)=><div key={i}><b>{m.user}:</b> {m.text}</div>)}</div><div className="input-group"><input className="form-control" value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}/><button className="btn btn-primary" onClick={send}>Send</button></div></div></aside></div></div>
}
