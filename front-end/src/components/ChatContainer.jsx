import React, { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime, formatMessageDateLabel } from "../lib/utils";
import { ChevronLeft, Download, X } from "lucide-react";
import { useSocketContext } from "../Context/SocketContext";
import notify from "../assets/sound/notification.mp3";

const ChatContainer = ({ onBackClick }) => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unSubscribeFromMessages,
  } = useChatStore();

  const { socket } = useSocketContext();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [transitionKey, setTransitionKey] = useState(0);
  const modalRef = useRef(null);

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
  }, [socket, messages]);

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

  useEffect(() => {
    if (selectedImage && modalRef.current) {
      modalRef.current.focus();
    }
  }, [selectedImage]);

  const imageUrls = messages.filter((msg) => msg.image).map((msg) => msg.image);

  const showNextImage = () => {
    const index = imageUrls.indexOf(selectedImage);
    if (index !== -1 && index < imageUrls.length - 1) {
      setTransitionKey((prev) => prev + 1);
      setSelectedImage(imageUrls[index + 1]);
    }
  };

  const showPrevImage = () => {
    const index = imageUrls.indexOf(selectedImage);
    if (index > 0) {
      setTransitionKey((prev) => prev + 1);
      setSelectedImage(imageUrls[index - 1]);
    }
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    handleSwipeGesture();
  };

  const handleSwipeGesture = () => {
    const deltaX = touchStartX.current - touchEndX.current;
    if (Math.abs(deltaX) < 50) return;
    deltaX > 0 ? showNextImage() : showPrevImage();
  };

  const downloadImage = async (url) => {
    try {
      const res = await fetch(url, { mode: "cors" });
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = url.split("/").pop() || "image.jpg";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

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
        {messages.map((message, index) => {
          const currentDateLabel = formatMessageDateLabel(message.createdAt);
          const previousDateLabel =
            index > 0
              ? formatMessageDateLabel(messages[index - 1].createdAt)
              : null;
          const shouldShowDateLabel =
            index === 0 || currentDateLabel !== previousDateLabel;

          return (
            <div key={message._id}>
              {shouldShowDateLabel && (
                <div className="text-center text-xs opacity-70 my-2 font-medium">
                  {currentDateLabel}
                </div>
              )}

              <div
                className={`chat ${
                  message.senderId === authUser._id ? "chat-end" : "chat-start"
                }`}
                ref={index === messages.length - 1 ? messageEndRef : null}
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
                  <time className="text-xs opacity-60 ml-1">
                    {formatMessageTime(message.createdAt)}
                  </time>
                </div>

                <div className="chat-bubble flex flex-col">
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="sm:max-w-[200px] rounded-md mb-2 cursor-pointer"
                      onClick={() => setSelectedImage(message.image)}
                    />
                  )}
                  {message.text && <p>{message.text}</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <MessageInput />

      {selectedImage && (
        <div
          ref={modalRef}
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setSelectedImage(null);
            if (e.key === "ArrowRight") showNextImage();
            if (e.key === "ArrowLeft") showPrevImage();
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          tabIndex={0}
        >
          <div className="relative">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow text-black hover:bg-gray-200"
            >
              <X className="size-5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                showPrevImage();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-white text-3xl px-3 hover:text-gray-300"
            >
              ←
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                showNextImage();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-3xl px-3 hover:text-gray-300"
            >
              →
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                downloadImage(selectedImage);
              }}
              className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow hover:bg-gray-200"
              aria-label="Download Image"
            >
              <Download className="size-5 text-black" />
            </button>

            <img
              key={transitionKey}
              src={selectedImage}
              alt="Full View"
              className="max-w-[90vw] max-h-[90vh] rounded-lg transition-all duration-300 ease-in-out"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              {imageUrls.indexOf(selectedImage) + 1} / {imageUrls.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatContainer;
