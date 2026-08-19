const router=require('express').Router();
const Booking=require('../models/Booking');
router.post('/profile',async(req,res)=>{
 const User=require('../models/User'); const u=await User.findByIdAndUpdate(req.user.id,{role:'tutor'},{new:true}).select('-passwordHash');
 res.json(u);
});
router.get('/bookings',async(req,res)=>res.json(await Booking.find({$or:[{tutor:req.user.id},{student:req.user.id}]}).populate('tutor student','name email').sort({start:1})));
router.post('/bookings',async(req,res)=>{
 const {tutor,start,end,topic}=req.body; const s=new Date(start), e=new Date(end);
 if(!(s<e))return res.status(400).json({message:'Invalid time range'});
 const conflict=await Booking.findOne({tutor,start:{$lt:e},end:{$gt:s}});
 if(conflict)return res.status(409).json({message:'Tutor already booked for this time'});
 const booking=await Booking.create({tutor,student:req.user.id,start:s,end:e,topic});
 res.status(201).json(booking);
});
module.exports=router;
