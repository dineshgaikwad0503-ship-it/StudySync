const router=require('express').Router();
const crypto=require('crypto');
const Group=require('../models/Group');

router.get('/',async(req,res)=>res.json(await Group.find({members:req.user.id}).populate('owner','name email')));
router.post('/',async(req,res)=>{
 const inviteCode=crypto.randomBytes(6).toString('hex');
 const group=await Group.create({name:req.body.name,description:req.body.description,owner:req.user.id,members:[req.user.id],inviteCode});
 res.status(201).json(group);
});
router.post('/join/:code',async(req,res)=>{
 const group=await Group.findOne({inviteCode:req.params.code});
 if(!group) return res.status(404).json({message:'Invalid invite code'});
 if(!group.members.some(x=>String(x)===String(req.user.id))) group.members.push(req.user.id);
 await group.save(); res.json(group);
});
router.get('/:id',async(req,res)=>{
 const group=await Group.findById(req.params.id).populate('members','name email');
 if(!group)return res.status(404).json({message:'Group not found'});
 if(!group.members.some(m=>String(m._id)===String(req.user.id)))return res.status(403).json({message:'Members only'});
 res.json(group);
});
module.exports=router;
