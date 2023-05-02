import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
    },
    allowedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    typeRoom: {
      type: String,
      default: "",
    },
  },
  {timestamps: true}
);
const Chat = mongoose.model("Chat", chatRoomSchema);
export default Chat;
