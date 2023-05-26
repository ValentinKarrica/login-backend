import { Schema, model } from "mongoose";
import validator from "validator";

interface IUser {
  name: string;
  email: string;
  photo: string;
  password: string;
  passwordConfirm: string;
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
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
  },
});

const User = model("User", userSchema);

export default User;
