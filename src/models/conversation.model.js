import mongoose, { mongo } from "mongoose";



const ConversationSchema = new mongoose.Schema(
  {
    jparticipants: [
      {
        participant: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "participants.participantModel",
        },
        participantModel: { type: String, enum: ["User", "Guide"] },
      },
    ],

    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    isGroupChat: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", ConversationSchema);

export default Conversation;
