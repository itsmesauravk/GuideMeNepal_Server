import { DataTypes } from "sequelize";
import { sequelize } from "../db/ConnectDB.js";

const Conversation = sequelize.define(
  "Conversation",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    isGroupChat: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    groupName: {
      type: DataTypes.STRING,
      allowNull: true, // Null for private chats, required for group chats
    },
    groupImage: {
      type: DataTypes.STRING,
      allowNull: true, // Null for private chats, required for group chats
    },
    lastMessage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // We'll handle participants and lastMessage through associations
  },
  {
    timestamps: true,
    tableName: "conversations",
  }
);

//  Participant -> join table for many-to-many relationships 
 const Participant = sequelize.define(
  "Participant",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    participantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    participantModel: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [["User", "Guide"]],
      },
    },
    conversationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "conversations",
        key: "id",
      },
    },
  },
  {
    timestamps: true,
    tableName: "participants",
    indexes: [
      {
        fields: ["participantId", "participantModel", "conversationId"],
        unique: true,
      },
    ],
  }
);


// One conversation has many participants
Conversation.hasMany(Participant, {
  foreignKey: 'conversationId',
  as: 'participants'
});

// A participant belongs to one conversation
Participant.belongsTo(Conversation, {
  foreignKey: 'conversationId',
  as: 'conversation'
});


export { Conversation, Participant };