const mongoose = require('mongoose');

const authSchema = new mongoose.Schema({
  refreshToken:{
    require : true ,
    type: String,
  },
})
module.exports = mongoose.model('auth', authSchema)
