const mongoose=require('mongoose');
module.exports=mongoose.model('Resource',new mongoose.Schema({
 group:{type:mongoose.Schema.Types.ObjectId,ref:'Group'}, uploader:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
 originalName:String, objectKey:String, url:String, mimeType:String, size:Number
},{timestamps:true}));
