import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const AdminSchema = new mongoose.Schema(
  {
    fullname: {
         type: String,
          required: true
         },
    email: {
         type: String,
          required: true,
           unique: true,
            lowercase: true },
    contact: { 
        type: String,
         required: true
         },
    password: { 
        type: String,
         required: true
         },
    securityMetadata: {
      wrongPasswordCounter: {
         type: Number,
          default: 0 
        },
      isSuspended: { 
        type: Boolean, 
        default: false },
    },
    otp: { 
        code: String,
        expiresAt: Date },
    refreshToken: { 
        type: String
     },
  },
  { timestamps: true }
);

AdminSchema.pre("save", async function (next) {
  try {
    if(!this.isModified("password")) {
       return next();
    }

    const salt = bcrypt.genSaltSync(10)
    this.password = bcrypt.hashSync(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }

})



const Admin = mongoose.model("Admin", AdminSchema);

export default Admin;
