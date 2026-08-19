const {Server}=require('socket.io');

function initSocket(httpServer){
 const io=new Server(httpServer,{cors:{origin:process.env.CLIENT_URL||'http://localhost:5173'}});
 io.on('connection',socket=>{
  socket.on('joinRoom',({roomId,user})=>{
   socket.join(roomId);
   socket.data.roomId=roomId; socket.data.user=user||'Anonymous';
   socket.to(roomId).emit('presence',{type:'joined',user:socket.data.user});
  });
  socket.on('leaveRoom',({roomId})=>socket.leave(roomId));
  socket.on('chatMessage',({roomId,text,user})=>{
   if(!text?.trim())return;
   io.to(roomId).emit('chatMessage',{id:Date.now()+Math.random(),text:text.trim(),user:user||socket.data.user,createdAt:new Date().toISOString()});
  });
  // Clean whiteboard broadcasting logic:
  socket.on('beginStroke',({roomId,point})=>socket.to(roomId).emit('beginStroke',{point}));
  socket.on('drawStroke',({roomId,from,to,stroke})=>socket.to(roomId).emit('drawStroke',{from,to,stroke}));
  socket.on('endStroke',({roomId})=>socket.to(roomId).emit('endStroke'));
  socket.on('clearBoard',({roomId})=>io.to(roomId).emit('clearBoard'));
  socket.on('disconnect',()=>{
   const roomId=socket.data.roomId;
   if(roomId)socket.to(roomId).emit('presence',{type:'left',user:socket.data.user});
  });
 });
 return io;
}
module.exports={initSocket};
