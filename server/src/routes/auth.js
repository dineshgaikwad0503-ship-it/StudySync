const router=require('express').Router();
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const User=require('../models/User');

router.post('/register',async(req,res)=>{
 try{
  const {name,email,password}=req.body;
  if(!name||!email||!password) return res.status(400).json({message:'name, email and password required'});
  if(await User.findOne({email})) return res.status(409).json({message:'Email already registered'});
  const passwordHash=await bcrypt.hash(password,12);
  const user=await User.create({name,email,passwordHash});
  const token=jwt.sign({id:user._id,email:user.email,name:user.name,role:user.role},process.env.JWT_SECRET,{expiresIn:'7d'});
  res.status(201).json({token,user:{id:user._id,name:user.name,email:user.email,role:user.role}});
 }catch(e){res.status(500).json({message:e.message});}
});
router.post('/login',async(req,res)=>{
 try{
  const {email,password}=req.body; const user=await User.findOne({email});
  if(!user||!(await bcrypt.compare(password,user.passwordHash))) return res.status(401).json({message:'Invalid credentials'});
  const token=jwt.sign({id:user._id,email:user.email,name:user.name,role:user.role},process.env.JWT_SECRET,{expiresIn:'7d'});
  res.json({token,user:{id:user._id,name:user.name,email:user.email,role:user.role}});
 }catch(e){res.status(500).json({message:e.message});}
});
module.exports=router;
