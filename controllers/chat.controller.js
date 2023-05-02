import express from "express";
import mongoose from "mongoose";
import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";

export const createChat = async (req, res, next) => {
  try {
    const {allowedUsers, typeRoom} = req.body;
    let name = req.body.name;
    if (typeRoom === "DM") {
      const existChat = await Chat.findOne({
        allowedUsers: {$all: allowedUsers},
        typeRoom: "DM",
      });
      if (existChat != null) {
        return res
          .status(200)
          .json({chatID: existChat._id, name: existChat.name});
      }
    }
    let chat = new Chat();
    if(name) chat.name = name;
    else{
      name = "";
      for(let i=0; i<2; i++){
        const user = await User.findById(allowedUsers[i]);
        if(i==0){
          name = "--" + user.username;
        }
        else{
          name = name + " & " + user.username + "--";
        }
      }
    }
    chat.name = name;
    if (allowedUsers) chat.allowedUsers = allowedUsers;
    if (typeRoom) chat.typeRoom = typeRoom;
    await chat.save();
    // Add the new room to all allowed users' chatRooms
    await User.updateMany(
      {_id: {$in: allowedUsers}},
      {$addToSet: {chatRooms: chat._id}}
    );
    res.status(201).json({chatID: chat._id, name: chat.name});
  } catch (error) {
    res.status(500).json({error: error.message});
  }
};

// getchat ที่ต้องการจะเข้าไปอ่าน ต้องเช็คก่อนว่ามีแชทนั้นยัง เช่น จะdm ไปหาคนที่ไม่เคยคุย
export const getChatRoom = async (req, res, next) => {
  const chatID = req.query.chatID;
  try{
  
    let chat = await Chat.findById(chatID).populate({
      path: "allowedUsers"
    });
    if(chat){
      return res.send(chat.allowedUsers);
    }
    return res.send("can't find chatRoom");
  }
  catch (error) {
    res.status(500).json({message: error.message});
  }
}

export const showGroupMember = async (req, res, next) => {
  const chatId = req.params.chatId;
  try {
    const chat = await Chat.findById(chatId).populate({
      path: "allowedUsers"
    });
    if (!chat) {
      return res.status(404).json({error: "Chat not found"});
    }
    const usernames = chat.allowedUsers.map(user => user.username);
    return res.status(200).json({ usernames });
  } catch (error) {
    res.status(500).json({error: "An error occurred while getting chat rooms"});
  }
};

//getAllChat ใช้ในหน้าว่ามีแชทกลุ่มไหนบ้าง
export const getAllChatRoomInServer = async (req, res, next) => {
  const typeRoom = req.query.typeRoom;
  let condition = {};
  condition.typeRoom = typeRoom;
  try {
    let chats = await Chat.find(condition);
    return res.send(chats);
  } catch (error) {
    return res.status(500).json({message: error.message});
  }
};

//check ว่าอยู่ในchatกลุ่ม นั้นยัง
export const haveChat = async (req, res, next) => {
  const {chat_id} = req.body;
  try{
    let chat = await Chat.findById(chat_id);
    if(chat){
      return res.send("yes");
    }
    res.send("no");
  }
  catch (error) {
    res.status(500).json({message: error.message});
  }
}

//join chat group
export const joinChat = async (req, res, next) => {
  const {chatID, userID} = req.body;
  try {
    const chat = await Chat.findOneAndUpdate(
      {_id: chatID},
      {$addToSet: {allowedUsers: userID}},
      {new: true}
    );
    await User.findOneAndUpdate(
      {_id: userID},
      {$addToSet: {chatRooms: chatID}},
      {new: true}
    );
    return res.json({chatID: chatID, name: chat.name});
  } catch (error) {
    return res.status(500).json({message: error.message});
  }
};
