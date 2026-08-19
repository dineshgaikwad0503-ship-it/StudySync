import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {io} from 'socket.io-client';
import 'bootstrap/dist/css/bootstrap.min.css';

const API=import.meta.env.VITE_API_URL||'http://localhost:5000/api';
const SOCKET=import.meta.env.VITE_SOCKET_URL||'http://localhost:5000';

async function api(path,options={}){
 const token=localStorage.getItem('token');
 const headers=options.body instanceof FormData?{}:{'Content-Type':'application/json'};
 if(token)headers.Authorization=`Bearer ${token}`;
 const r=await fetch(API+path,{...options,headers:{...headers,...(options.headers||{})}});
 const data=await r.json().catch(()=>({}));
 if(!r.ok)throw new Error(data.message||'Request failed');
 return data;
}

function Whiteboard({roomId}){
 const canvasRef=useRef(null), drawing=useRef(false), last=useRef(null), socket=useRef(null);
 const [online,setOnline]=useState(1);
 useEffect(()=>{
  const c=canvasRef.current,ctx=c.getContext('2d');
  c.width=c.clientWidth*devicePixelRatio;c.height=c.clientHeight*devicePixelRatio;ctx.scale(devicePixelRatio,devicePixelRatio);
  socket.current=io(SOCKET);socket.current.emit('joinRoom',{roomId,user:localStorage.getItem('name')||'Student'});
  const draw=(a,b,remote=false)=>{ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=remote?'#0d6efd':'#212529';ctx.lineWidth=2;ctx.stroke();};
  socket.current.on('drawStroke',({from,to})=>draw(from,to,true));
  socket.current.on('clearBoard',()=>ctx.clearRect(0,0,c.clientWidth,c.clientHeight));
  socket.current.on('presence',()=>setOnline(x=>Math.max(1,x+1)));
  return()=>socket.current.disconnect();
 },[roomId]);
 const pos=e=>{const r=canvasRef.current.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}};
 const down=e=>{drawing.current=true;last.current=pos(e);socket.current.emit('beginStroke',{roomId,point:last.current})};
 const move=e=>{if(!drawing.current)return;const p=pos(e),from=last.current;const ctx=canvasRef.current.getContext('2d');ctx.beginPath();ctx.moveTo(from.x,from.y);ctx.lineTo(p.x,p.y);ctx.stroke();socket.current.emit('drawStroke',{roomId,from,to:p,stroke:{width:2}});last.current=p};
 const up=()=>{drawing.current=false;socket.current.emit('endStroke',{roomId})};
 return <div><div className="d-flex justify-content-between mb-2"><strong>Collaborative Whiteboard</strong><span className="badge text-bg-success">{online} online</span></div><canvas ref={canvasRef} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up} style={{width:'100%',height:420,border:'2px solid #dee2e6',borderRadius:12,touchAction:'none',background:'#fff'}}/><button className="btn btn-outline-danger btn-sm mt-2" onClick={()=>socket.current.emit('clearBoard',{roomId})}>Clear</button></div>
}

function Room({group}){
 const [messages,setMessages]=useState([]),[text,setText]=useState('');
 const socket=useRef(null);
 useEffect(()=>{socket.current=io(SOCKET);socket.current.emit('joinRoom',{roomId:group._id,user:localStorage.getItem('name')});socket.current.on('chatMessage',m=>setMessages(x=>[...x,m]));return()=>socket.current.disconnect()},[group._id]);
 const send=()=>{if(text.trim()){socket.current.emit('chatMessage',{roomId:group._id,text,user:localStorage.getItem('name')});setText('')}};
 return <div className="container py-4"><h2>{group.name} <span className="badge text-bg-primary">Live Room</span></h2><div className="row g-4 mt-1"><div className="col-lg-8"><Whiteboard roomId={group._id}/></div><div className="col-lg-4"><div className="card h-100"><div className="card-header">Live Chat</div><div className="card-body" style={{height:430,overflowY:'auto'}}>{messages.map(m=><div key={m.id} className="mb-2"><b>{m.user}</b><div className="bg-light rounded p-2">{m.text}</div></div>)}</div><div className="card-footer d-flex gap-2"><input className="form-control" value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Message..."/><button className="btn btn-primary" onClick={send}>Send</button></div></div></div></div></div>
}

function App(){
 const [user,setUser]=useState(localStorage.getItem('token')?{name:localStorage.getItem('name')}:null);
 const [groups,setGroups]=useState([]),[active,setActive]=useState(null),[form,setForm]=useState({name:'',email:'',password:''}),[mode,setMode]=useState('login'),[error,setError]=useState('');
 const load=async()=>{try{setGroups(await api('/groups'))}catch(e){setError(e.message)}};
 useEffect(()=>{if(user)load()},[user]);
 const auth=async()=>{try{const d=await api('/auth/'+mode,{method:'POST',body:JSON.stringify(form)});localStorage.setItem('token',d.token);localStorage.setItem('name',d.user.name);setUser(d.user);setError('')}catch(e){setError(e.message)}};
 const create=async()=>{const name=prompt('Group name');if(!name)return;const g=await api('/groups',{method:'POST',body:JSON.stringify({name,description:'Study group'})});setGroups(x=>[g,...x])};
 if(!user)return <div className="min-vh-100 d-flex align-items-center bg-light"><div className="card mx-auto p-4 shadow" style={{maxWidth:440,width:'100%'}}><h1 className="fw-bold">StudySync</h1><p className="text-muted">Your digital library study group.</p>{mode==='register'&&<input className="form-control mb-2" placeholder="Name" onChange={e=>setForm({...form,name:e.target.value})}/>}<input className="form-control mb-2" placeholder="Email" onChange={e=>setForm({...form,email:e.target.value})}/><input className="form-control mb-3" type="password" placeholder="Password" onChange={e=>setForm({...form,password:e.target.value})}/>{error&&<div className="alert alert-danger">{error}</div>}<button className="btn btn-primary w-100" onClick={auth}>{mode==='login'?'Login':'Create account'}</button><button className="btn btn-link w-100 mt-2" onClick={()=>setMode(mode==='login'?'register':'login')}>{mode==='login'?'New student? Register':'Already registered? Login'}</button></div></div>;
 if(active)return <><nav className="navbar navbar-dark bg-dark px-3"><span className="navbar-brand">StudySync</span><button className="btn btn-outline-light" onClick={()=>setActive(null)}>Back to groups</button></nav><Room group={active}/></>;
 return <><nav className="navbar navbar-dark bg-dark px-3"><span className="navbar-brand">StudySync</span><span className="text-white">{user.name} <button className="btn btn-sm btn-outline-light ms-2" onClick={()=>{localStorage.clear();location.reload()}}>Logout</button></span></nav><main className="container py-5"><div className="d-flex justify-content-between align-items-center mb-4"><div><h1>Study Dashboard</h1><p className="text-muted">Groups, live rooms, chat and collaborative learning.</p></div><button className="btn btn-primary" onClick={create}>+ Create Group</button></div><div className="row g-3">{groups.map(g=><div className="col-md-6 col-lg-4" key={g._id}><div className="card h-100 shadow-sm"><div className="card-body"><h5>{g.name}</h5><p className="text-muted">{g.description}</p><span className="badge text-bg-light">{g.members?.length||1} members</span><button className="btn btn-dark w-100 mt-3" onClick={()=>setActive(g)}>Enter Study Room</button><div className="small text-muted mt-2">Invite code: {g.inviteCode}</div></div></div></div>)}</div>{!groups.length&&<div className="alert alert-info mt-4">Create your first study group to start.</div>}</main></>
}
createRoot(document.getElementById('root')).render(<App/>);
