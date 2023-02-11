const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  task:{
    required:true,
    type: String
  },
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Data'
  },
  comp:{
    required : true,
    type: Boolean
  }
})
module.exports = mongoose.model('Todo', todoSchema)
