import { DataTypes } from "sequelize";
import { sequelize } from "../db/ConnectDB.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const Admin = sequelize.define(
  "Admin",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fullname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        isLowercase: true,
      },
    },
    contact: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    securityMetadata: {
      type: DataTypes.JSONB, // Use JSONB for nested objects
      defaultValue: {
        wrongPasswordCounter: 0,
        isSuspended: false,
      },
    },
    otp: {
      type: DataTypes.JSONB,
      allowNull: true,
      
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true, 
    tableName: "admin",
  }
);

// Hash password before saving
Admin.beforeCreate(async (admin) => {
  if (admin.password) {
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(admin.password, salt);
  }
});

// Hash password before updating if it has changed
Admin.beforeUpdate(async (admin) => {
  if (admin.changed("password")) {
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(admin.password, salt);
  }
});

// Method to match passwords - prototype method
Admin.prototype.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to increment wrong password counter
Admin.prototype.wrongPassword = async function () {
  this.securityMetadata.wrongPasswordCounter += 1;
  await this.save();
};

// Method to generate OTP
Admin.prototype.getOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
  this.otp = {
    code: otp,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  };
  return otp;
};

// Method to generate access token
Admin.prototype.getAccessToken = function () {
  return jwt.sign({ id: this.id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
  });
};

// Method to generate refresh token
Admin.prototype.getRefreshToken = function () {
  return jwt.sign({ id: this.id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  });
};

export default Admin;