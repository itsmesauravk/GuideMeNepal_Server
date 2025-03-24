import { DataTypes } from "sequelize";
import { sequelize } from "../db/ConnectDB.js";
import slug from "slug";


const District = sequelize.define(
    "District",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        tags: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        image: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        guideRegistered: {  
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        bookings: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        views: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        coordinates: {
            type: DataTypes.JSON,  // {lat: 0, lng: 0}
            allowNull: true,
        }
    },
    {
        timestamps: false,
    }
);

export default District;

