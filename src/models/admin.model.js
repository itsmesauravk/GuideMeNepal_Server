import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


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

// for matching password
AdminSchema.methods.matchPassword = async function (enteredPassword) {
  const isMatch =  await bcrypt.compare(enteredPassword, this.password)
  return isMatch
}

// wrong password counter
AdminSchema.methods.wrongPassword = async function () {
  this.securityMetadata.wrongPasswordCounter += 1
  await this.save()
}


//for generating otp
AdminSchema.methods.getOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000); //generating 6 digit otp
  this.otp = {
    code: otp,
    expiresAt: Date.now() + 10 * 60 * 1000,
  };
  return otp;
};



//for generating access token
AdminSchema.methods.getAccessToken = function () {
  const aToken = jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
  });
  return aToken;
};

//for generating refresh token
AdminSchema.methods.getRefreshToken = function () {
  const rToken = jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  });
  return rToken;
};




const Admin = mongoose.model("Admin", AdminSchema);

export default Admin;
