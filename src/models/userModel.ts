import { Schema, model } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
// const bcrypt = require('bcryptjs');

interface IUser {
  name: string;
  email: string;
  photo: string | undefined;
  password: string;
  passwordConfirm: string | undefined;
  passwordChangedAt: Date | undefined;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: [true, "Name is required"] },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  photo: String,
  password: {
    type: String,
    required: [true, "Please provide your password"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
  },
  passwordChangedAt: Date,
});

userSchema.pre("save", async function(next) {
  // Check password and confirm password are same
  if (this.password && this.passwordConfirm) {
    let isSame = this.password === this.passwordConfirm;
    if (!isSame) {
      throw Error("Password and Confirm password did not match");
    }
  }

  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = this.passwordChangedAt.getTime() / 1000;
    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

const User = model("User", userSchema);

export default User;
