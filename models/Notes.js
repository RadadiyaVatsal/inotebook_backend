const { toBeRequired } = require('@testing-library/jest-dom/matchers');
const { type } = require('@testing-library/user-event/dist/type');
const mongoose=require('mongoose');
const {Schema} = mongoose;

const NotesSchema = new Schema({
   user:{
      type:mongoose.Schema.ObjectId, // this is like foreign key it works similarly
      ref:'user'
   },
   title:{
    type:String,
    required:true
   },
   description:{
    type:String,
    required:true,
   },
   tag:{
    type:String,
    default:"General"
   },
   
   date:{
    type:Date,
    default:Date.now
   },
   });

   module.exports = mongoose.model('notes' , NotesSchema);