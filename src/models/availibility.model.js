import { DataTypes } from "sequelize";
import { sequelize } from "../db/ConnectDB.js";
import Guide from "./guide.model.js";

const Availability = sequelize.define(
  "Availability",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    guideId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Guide,
        key: 'id'
      }
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    reason: {
      type: DataTypes.ENUM,
      values: ['PERSONAL', 'BOOKED', 'HOLIDAY'],
      defaultValue: 'PERSONAL',
    },
  },
  {
    timestamps: true,
    tableName: "guide_availability",
  }
);

// Define association
Guide.hasMany(Availability, { foreignKey: 'guideId' });
Availability.belongsTo(Guide, { foreignKey: 'guideId' });

export default Availability;    