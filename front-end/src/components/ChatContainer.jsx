import React, { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { ChevronLeft } from "lucide-react";
import { useSocketContext } from "../Context/SocketContext";
import notify from '../assets/sound/notification.mp3'

const ChatContainer = ({ onBackClick }) => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unSubscribeFromMessages,
  } = useChatStore();

  const {socket} = useSocketContext()
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);


  useEffect(() => {
    const handleNewMessage = (newMessage) => {
      const { selectedUser } = useChatStore.getState();

      const sound = new Audio(notify);
      sound.play();

      if (newMessage.senderId === selectedUser?._id) {
        useChatStore.setState((state) => ({
          messages: [...state.messages, newMessage],
        }));
      }
    };

    socket?.on("newMessage", handleNewMessage);

    return () => {
      socket?.off("newMessage");
    };
  }, [socket,messages]);



  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unSubscribeFromMessages();
  }, [
    selectedUser._id,
    getMessages,
    subscribeToMessages,
    unSubscribeFromMessages,
  ]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading)
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        {onBackClick && (
          <button
            onClick={onBackClick}
            className="lg:hidden p-3 flex items-center gap-2 border-b border-base-300"
          >
            <ChevronLeft className="size-5" />
            <span>Back</span>
          </button>
        )}
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      {onBackClick && (
        <button
          onClick={onBackClick}
          className="lg:hidden p-3 flex items-center gap-2 border-b border-base-300"
        >
          <ChevronLeft className="size-5" />
          <span>Back</span>
        </button>
      )}
      <ChatHeader />

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId === authUser._id ? "chat-end" : "chat-start"
            }`}
            ref={messageEndRef}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>

            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>

            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;