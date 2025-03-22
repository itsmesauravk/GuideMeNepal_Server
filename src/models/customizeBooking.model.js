import { DataTypes } from "sequelize";
import { sequelize } from "../db/ConnectDB.js";
import User from "./user.model.js";
import Guide from "./guide.model.js";

const CustomizeBooking = sequelize.define(
  "CustomizeBooking",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      references: {
        model: 'users', 
        key: 'id'
      },
      field: 'user' ,
     
    },
    guideId: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      references: {
        model: 'guides', 
        key: 'id'
      },
      field: 'guide' 
    },
    destination: { type: DataTypes.STRING, allowNull: false },
    startingLocation: { type: DataTypes.STRING },
    accommodation: { type: DataTypes.STRING, defaultValue: null }, // Tourist accommodation
    numberOfAdults: { type: DataTypes.INTEGER, allowNull: false },
    numberOfChildren: { type: DataTypes.INTEGER, defaultValue: 0 },
    estimatedDays: { type: DataTypes.INTEGER, allowNull: false },
    estimatedPrice: { type: DataTypes.FLOAT },
    startDate: { type: DataTypes.DATE },
    endDate: { type: DataTypes.DATE },
    bookingDate: { type: DataTypes.DATE },
    bookingMessage: { type: DataTypes.TEXT, defaultValue: null },

    bookingType: {
      type: DataTypes.ENUM("customize", "group", "private"),
      defaultValue: "customize",
    },
    bookingStatus: {
      type: DataTypes.ENUM("pending", "canceled", "accepted", "rejected"),
      defaultValue: "pending",
    },
    travelStatus: {
      type: DataTypes.ENUM("not-started", "on-going", "completed"),
      defaultValue: "not-started",
    },

    platformLiability: { type: DataTypes.BOOLEAN, defaultValue: false }, // Is platform responsible for booking?
  },
  { timestamps: true }
);

CustomizeBooking.belongsTo(Guide, { foreignKey: 'guideId' });
Guide.hasMany(CustomizeBooking, { foreignKey: 'guideId' });

CustomizeBooking.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(CustomizeBooking, { foreignKey: 'userId' });



export default CustomizeBooking;
