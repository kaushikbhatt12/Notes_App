const mongoose = require('mongoose');
const { Schema } = mongoose;


const NotesSchema = new Schema({
  user:{                                      //acts as a foreign key to denote a particular group of notes belongs to which user
    type : mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  title:{
    type:String,
    required : true
  },
  description:{
    type:String,
    required : true,
  },
  tag:{
    type:String,
    default : "general"
  },
  date:{
    type:Date,
    default : Date.now
  },
});

module.exports = mongoose.model('notes',NotesSchema);