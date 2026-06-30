import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: [true, 'Email already exists'],
    required: true,
  },
  contact: {
    type: String,
    //  required: true
    required: false,
  },
  password: { type: String, 
    required: function(){
      return !this.googleId; // agar googleId hai toh password no-need ,else needed
    }
 },
  fullname: { type: String, required: true },
  role: {
    type: String,
    enum: ['buyer', 'seller'],
    default: 'buyer',
  },
  googleId: { type: String },
});

userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const userModel = mongoose.model('user', userSchema);

export default userModel;
