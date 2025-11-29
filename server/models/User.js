const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, unique: true,required:true },
  // username: { type: String, unique: true, required: true },
  bio: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  links: [
    {
      title: String,
      url: String
    }
  ]
});

module.exports = mongoose.model('User', UserSchema);
