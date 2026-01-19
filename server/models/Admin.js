import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },
  },
  { timestamps: true }
);

/* ===============================
   HASH PASSWORD BEFORE SAVE
   =============================== */
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

/* ===============================
   COMPARE PASSWORD
   =============================== */
adminSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

/* ===============================
   SAFE EXPORT (NO OVERWRITE ERROR)
   =============================== */
export default mongoose.models.Admin ||
  mongoose.model("Admin", adminSchema);
