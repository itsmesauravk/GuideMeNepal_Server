import { sequelize } from "../db/ConnectDB.js";
import { DataTypes } from "sequelize";
import User  from "./user.model.js";
import Guide  from "./guide.model.js";
import CustomizeBooking  from "./customizeBooking.model.js";


const Notification = sequelize.define(
    "Notification",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        notificationType: {
            type: DataTypes.ENUM("auth", "booking", "trip", "review" ,"other"),
            allowNull: false,
        },
        isRead: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        reciver:{
            type: DataTypes.ENUM("user", "guide", "admin"),
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "users",
                key: "id",
            },
        },
        guideId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "guides",
                key: "id",
            },
        },
        bookingId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "CustomizeBookings",
                key: "id",
            },
        },
        metadata: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
    },
    {
        timestamps: true,
        tableName: "notifications",
    }
);

// Define the relationship with User model
Notification.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Notification, { foreignKey: "userId" });
/// Define the relationship with Guide model
Notification.belongsTo(Guide, { foreignKey: "guideId" });
Guide.hasMany(Notification, { foreignKey: "guideId" });

// Define the relationship with Booking model
Notification.belongsTo(CustomizeBooking, { foreignKey: "bookingId" });
CustomizeBooking.hasMany(Notification, { foreignKey: "bookingId" });


export default Notification;

