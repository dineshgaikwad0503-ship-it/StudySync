const mongoose=require('mongoose');
const Question=new mongoose.Schema({
 text:String, options:[String], answer:Number
});
module.exports=mongoose.model('Quiz',new mongoose.Schema({
 title:String, group:{type:mongoose.Schema.Types.ObjectId,ref:'Group'}, creator:{type:mongoose.Schema.Types.ObjectId,ref:'User'}, questions:[Question]
},{timestamps:true}));
