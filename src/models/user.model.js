import { DataTypes } from "sequelize";
import {sequelize} from "../db/ConnectDB.js";
import jwt from "jsonwebtoken";
import slug from "slug";


const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
      required: true,
    },
    slug:{
      type: DataTypes.STRING,
      allowNull: false,
      unique:true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      required: true,
      unique: true,
      validate: {
        isEmail: true,
        isLowercase: true,
      },
      set(value) {
        this.setDataValue("email", value.toLowerCase().trim());
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    profilePicture:{
      type:DataTypes.STRING,
      default:null
    },
    contact: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    gender: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    dob:{
      type: DataTypes.DATE,
      defaultValue: null,
    },
    country:{
      type: DataTypes.STRING,
      defaultValue: null,
    },
    authMethod: {
      type: DataTypes.ENUM("email", "google", "facebook"),
      defaultValue: "email",
    },
    otpCode: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    otpExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastActiveAt:{
      type: DataTypes.DATE,
      allowNull: true,
    },
    isSuspended: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    tableName: "users",
  }
);

// Define associations
User.associate = (models) => {
  User.hasMany(models.CustomizeBooking, {
    foreignKey: "userId",
    as: "bookingHistory",
  });
};

//for generating access token
User.prototype.getAccessToken = function () {
  return jwt.sign({ id: this.id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
  });
};

export default User;