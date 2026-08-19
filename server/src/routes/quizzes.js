const router=require('express').Router();
const Quiz=require('../models/Quiz');
router.get('/group/:groupId',async(req,res)=>res.json(await Quiz.find({group:req.params.groupId}).select('-questions.answer')));
router.post('/',async(req,res)=>{
 const quiz=await Quiz.create({title:req.body.title,group:req.body.groupId,creator:req.user.id,questions:req.body.questions||[]});
 res.status(201).json(quiz);
});
router.post('/:id/submit',async(req,res)=>{
 const quiz=await Quiz.findById(req.params.id); if(!quiz)return res.status(404).json({message:'Quiz not found'});
 let score=0; (req.body.answers||[]).forEach((a,i)=>{if(quiz.questions[i]&&a===quiz.questions[i].answer)score++;});
 res.json({score,total:quiz.questions.length});
});
module.exports=router;
