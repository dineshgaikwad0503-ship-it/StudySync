const mongoose=require('mongoose');
module.exports=mongoose.model('Group',new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 description:String,
 owner:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
 members:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
 inviteCode:{type:String,unique:true,index:true}
},{timestamps:true}));
