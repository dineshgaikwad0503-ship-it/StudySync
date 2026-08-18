import express from "express"; import http from "http"; import {Server} from "socket.io";
const app=express(); app.get("/health",(q,s)=>s.json({status:"ok"}));
const server=http.createServer(app); const io=new Server(server,{cors:{origin:"*"}});
io.on("connection",socket=>{
 socket.on("room:join",({roomId,userId})=>{socket.join(roomId);socket.to(roomId).emit("presence:join",{userId})});
 socket.on("chat:message",m=>io.to(m.roomId).emit("chat:message",{...m,id:Date.now()}));
 socket.on("whiteboard:draw",d=>socket.to(d.roomId).emit("whiteboard:draw",d));
});
server.listen(4000,"0.0.0.0",()=>console.log("StudySync Socket.IO ready on 4000"));
