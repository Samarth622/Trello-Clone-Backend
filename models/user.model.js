import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", function (next) {
  const password = this.password;
  if (password && password.length < 6) {
    return next(new Error("Password must be at least 6 characters long."));
  }

  if (this.isModified("password")) {
    this.password = bcrypt.hashSync(password, 10);
  }
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compareSync(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
