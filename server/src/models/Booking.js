const mongoose=require('mongoose');
module.exports=mongoose.model('Booking',new mongoose.Schema({
 tutor:{type:mongoose.Schema.Types.ObjectId,ref:'User'}, student:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
 start:Date,end:Date,topic:String
},{timestamps:true}));
