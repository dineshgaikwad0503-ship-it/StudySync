const mongoose=require('mongoose');
module.exports=mongoose.model('User',new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 email:{type:String,required:true,unique:true,lowercase:true},
 passwordHash:{type:String,required:true},
 role:{type:String,enum:['student','tutor'],default:'student'},
 avatar:String
},{timestamps:true}));
