const router=require('express').Router();
const multer=require('multer');
const fs=require('fs');
const path=require('path');
const Resource=require('../models/Resource');
const Group=require('../models/Group');
const upload=multer({dest:path.join(process.cwd(),'uploads/')});

router.get('/group/:groupId',async(req,res)=>{
 const group=await Group.findById(req.params.groupId);
 if(!group||!group.members.some(x=>String(x)===String(req.user.id)))return res.status(403).json({message:'Members only'});
 res.json(await Resource.find({group:req.params.groupId}).sort({createdAt:-1}));
});
router.post('/group/:groupId',upload.single('file'),async(req,res)=>{
 const group=await Group.findById(req.params.groupId);
 if(!group||!group.members.some(x=>String(x)===String(req.user.id)))return res.status(403).json({message:'Members only'});
 if(!req.file)return res.status(400).json({message:'file required'});
 const r=await Resource.create({group:group._id,uploader:req.user.id,originalName:req.file.originalname,objectKey:req.file.filename,url:`/uploads/${req.file.filename}`,mimeType:req.file.mimetype,size:req.file.size});
 res.status(201).json(r);
});
module.exports=router;
