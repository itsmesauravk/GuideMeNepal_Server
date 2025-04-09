import { DataTypes } from "sequelize";
import { sequelize } from "../db/ConnectDB.js";

const GuideReview = sequelize.define(
  "GuideReview",
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
        model: "guides", // table name
        key: "id",
      },
      onDelete: "CASCADE",
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users", // table name
        key: "id",
      },
      onDelete: "CASCADE",
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 1.0,
        max: 5.0,
      },
    },
    destination: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    comments: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "guide_reviews",
  }
);

// Associations
GuideReview.associate = (models) => {
  GuideReview.belongsTo(models.User, {
    foreignKey: "userId",
    as: "user",
  });
  GuideReview.belongsTo(models.Guide, {
    foreignKey: "guideId",
    as: "guide",
  });
};

export default GuideReview;
