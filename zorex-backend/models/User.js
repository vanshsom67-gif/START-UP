const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "Zorexa User",
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Password kabhi bhi query result mein nahi aayega by default
    },
    role: {
      type: String,
      enum: ["user", "admin", "delivery"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt auto-add hoga
  }
);

// Save se pehle password hash karo
UserSchema.pre("save", async function () {
  // Agar password modify nahi hua toh skip karo
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Password compare method
UserSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

// JSON mein password hide karo
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", UserSchema);
