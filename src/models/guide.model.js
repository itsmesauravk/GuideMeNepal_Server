import { DataTypes } from "sequelize";
import{sequelize} from "../db/ConnectDB.js"; 
import jwt from "jsonwebtoken";
import slug from "slug";

const Guide = sequelize.define(
  "Guide",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
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
      defaultValue: null,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    registrationStatus:{
      type:DataTypes.ENUM,
      values:["pending","viewed","registered","rejected"],
      defaultValue:"pending",
    },
    firstTimeLogin: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    
    guideType:{
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull:false,
    },
    languageSpeak:{
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull:false,
    },
    profilePhoto:{
      type: DataTypes.STRING,
      allowNull:false,
    },
    liscensePhoto:{
      type: DataTypes.STRING,
      allowNull:false,
    },
    certificationPhoto:{
      type: DataTypes.STRING,
      default:null
    },
    // idPhoto:{
    //   type: DataTypes.ARRAY(DataTypes.STRING),
    //   allowNull:false,
    // },
    guidingAreas:{
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull:false,
      
    },
    selfVideo:{
      type: DataTypes.STRING,
      default:false
    },
    aboutMe:{
      type: DataTypes.TEXT,
      allowNull:false,
    },
    experiences:{
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue:null
    },
    gallery:{
      type: DataTypes.ARRAY(DataTypes.TEXT),
      default:null
    },

    securityMetadata: {
      type: DataTypes.JSONB,
      defaultValue: {
        lastPassword: null,
        wrongPasswordCounter: 0,
        isSuspended: false,
      },
    },
    availability: {
      type: DataTypes.JSONB, 
      defaultValue: {
        isActivate: true,
        isAvailable: true,
      },
    },
    lastActiveAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    otp: {
      type: DataTypes.JSONB,
      defaultValue: {
        code: null,
        expiresAt: null,
      },
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profileviews:{
      type: DataTypes.INTEGER,
      defaultValue:0
    },
  },
  {
    timestamps: true,
    tableName: "guides"
  }
);


//methods
Guide.prototype.getAccessToken = function () {
  return jwt.sign({ id: this.id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
  });
};



export default Guide;