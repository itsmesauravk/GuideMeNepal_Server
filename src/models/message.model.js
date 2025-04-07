import { DataTypes } from "sequelize";
import { sequelize } from "../db/ConnectDB.js";
import { Conversation } from "./conversation.model.js";

const Message = sequelize.define(
  "Message",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    conversationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "conversations",
        key: "id",
      },
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    senderModel: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [["User", "Guide"]],
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    contentType: {
      type: DataTypes.STRING,
      defaultValue: "text",
      validate: {
        isIn: [["text", "image", "video", "file"]],
      },
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "messages",
  }
);

// Define the relationship with Conversation model
Message.belongsTo(Conversation, {
  foreignKey: "conversationId",
  as: "conversation",
});

export { Message}