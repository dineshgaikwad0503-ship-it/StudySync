import express from "express";
import http from "http";
import cors from "cors";
import {Server} from "socket.io";
const app=express();app.use(cors());app.get("/health",(q,s)=>s.json({status:"ok"}));
const server=http.createServer(app);const io=new Server(server,{cors:{origin:"*",methods:["GET","POST"]}});
io.on("connection",socket=>{
 socket.on("room:join",({roomId})=>{socket.join(roomId);socket.to(roomId).emit("room:user_joined",{userId:socket.id})});
 socket.on("chat:message",m=>io.to(m.roomId).emit("chat:message",{...m,id:Date.now()}));
 socket.on("whiteboard:draw",d=>socket.to(d.roomId).emit("whiteboard:draw",d));
 socket.on("disconnect",()=>{});
});
server.listen(process.env.PORT||4000,()=>console.log("StudySync socket server running"));
