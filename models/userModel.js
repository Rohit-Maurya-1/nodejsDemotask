const mongoose = require('mongoose');
const { Token } = require('tedious/lib/token/token');
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  token:{
    type:String
  },
  registeredAt: { type: Date, required: true },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});




module.exports = mongoose.model('User', UserSchema);
