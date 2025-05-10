import { sequelize } from "../db/ConnectDB.js";
import { DataTypes } from "sequelize";
import User from "./user.model.js";
import Guide from "./guide.model.js";

const ReportGuide = sequelize.define(
    "ReportGuide",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
        },
        guideId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "guides",
                key: "id",
            },
        },
        status: {
            type: DataTypes.ENUM("pending", "reviewed", "resolved"),
            defaultValue: "pending",
        },
        metadata: {
            type: DataTypes.JSONB,
            allowNull: true,
        }
    },
    {
        timestamps: true,
        tableName: "reportguides",
    }
);

// Define the relationship with User model
ReportGuide.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(ReportGuide, { foreignKey: "userId", as: "reports" });

// Define the relationship with Guide model
ReportGuide.belongsTo(Guide, { foreignKey: "guideId", as: "guide" });
Guide.hasMany(ReportGuide, { foreignKey: "guideId", as: "reports" });



export default ReportGuide;