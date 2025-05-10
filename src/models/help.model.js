import { DataTypes } from "sequelize";
import { sequelize } from "../db/ConnectDB.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const HelpAndSupport = sequelize.define(
  "HelpAndSupport",
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
   message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("pending", "resolved"),
    defaultValue: "pending",
  },
},
  {
    timestamps: true, 
    tableName: "helpandsupport",
  }
);



export default HelpAndSupport;