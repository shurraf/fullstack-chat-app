import React, { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Search, ChevronLeft } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useSocketContext } from "../Context/SocketContext";

const Sidebar = ({ onUserSelect, onBackClick, showBackButton }) => {
  const {
    getUsers,
    users = [],
    selectedUser,
    setSelectedUser,
    isUsersLoading,
  } = useChatStore();
  const { onlineUsers = [], authUser } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationCounts, setNotificationCounts] = useState({});
  const { socket } = useSocketContext();

  // Load notificationCounts from localStorage on mount
  useEffect(() => {
    const storedCounts = localStorage.getItem("notificationCounts");
    if (storedCounts) {
      setNotificationCounts(JSON.parse(storedCounts));
    }
  }, []);

  // Save notificationCounts to localStorage on change
  useEffect(() => {
    localStorage.setItem(
      "notificationCounts",
      JSON.stringify(notificationCounts)
    );
  }, [notificationCounts]);

  useEffect(() => {
    socket?.on("newMessage", (newMessage) => {
      if (selectedUser?._id !== newMessage.senderId) {
        setNotificationCounts((prev) => {
          const currentCount = prev[newMessage.senderId] || 0;
          const updated = {
            ...prev,
            [newMessage.senderId]: currentCount + 1,
          };
          localStorage.setItem("notificationCounts", JSON.stringify(updated));
          return updated;
        });
      }

      useChatStore.setState((state) => {
        const updatedUsers = state.users.filter(
          (u) => u._id !== newMessage.senderId
        );
        const senderUser = state.users.find(
          (u) => u._id === newMessage.senderId
        );
        return {
          users: senderUser ? [senderUser, ...updatedUsers] : state.users,
        };
      });
    });

    return () => {
      socket?.off("newMessage");
    };
  }, [socket, selectedUser]);

  useEffect(() => {
    getUsers().catch((error) => {
      console.error("Failed to fetch users:", error);
    });
  }, [getUsers]);

  const filteredUsers = users.filter((user) => {
    const isOnline = onlineUsers.includes(user?._id);
    const matchesSearch = user?.fullName
      ?.toLowerCase()
      ?.includes(searchQuery.toLowerCase());

    if (showOnlineOnly) return isOnline && matchesSearch;
    return matchesSearch;
  });

  const handleUserClick = (user) => {
    if (user?._id) {
      setSelectedUser(user);
      if (onUserSelect) onUserSelect();

      setNotificationCounts((prev) => {
        const newCounts = { ...prev };
        delete newCounts[user._id];
        localStorage.setItem("notificationCounts", JSON.stringify(newCounts));
        return newCounts;
      });
    }
  };

  if (isUsersLoading) return <SidebarSkeleton />;

  const onlineCount = Math.max(
    0,
    onlineUsers.length - (onlineUsers.includes(authUser?._id) ? 1 : 0)
  );

  return (
    <aside
      className={`h-full ${
        showBackButton ? "w-full" : "w-full lg:w-72"
      } border-r border-base-300 flex flex-col transition-all duration-200`}
    >
      {showBackButton && (
        <button
          onClick={onBackClick}
          className="lg:hidden p-3 flex items-center gap-2 border-b border-base-300"
        >
          <ChevronLeft className="size-5" />
          <span>Back to contacts</span>
        </button>
      )}

      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium">Contacts</span>
        </div>

        <div className="mt-3 relative">
          <div className="flex items-center gap-2 bg-base-200 rounded-lg px-3 py-2">
            <Search className="size-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-zinc-400 hover:text-zinc-600"
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-sm text-zinc-400">({onlineCount} online)</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3 flex-1">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => {
            const unreadCount = notificationCounts[user._id] || 0;

            return (
              <button
                key={user._id}
                onClick={() => handleUserClick(user)}
                className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
                  selectedUser?._id === user._id ? "bg-base-300" : ""
                }`}
              >
                <div className="relative">
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={user.fullName || "User"}
                    className="size-12 rounded-full border border-base-300 object-cover"
                  />
                  {onlineUsers.includes(user._id) && (
                    <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-base-100" />
                  )}
                </div>
                <div className="text-left overflow-hidden">
                  <div className="font-medium truncate">{user.fullName}</div>
                  <div className="text-sm text-zinc-400 truncate">
                    {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                  </div>
                </div>

                <div className="ml-auto">
                  {unreadCount > 0 && (
                    <div className="rounded-full bg-green-600 text-white text-xs px-2 py-[1px]">
                      +{unreadCount}
                    </div>
                  )}
                </div>
              </button>
            );
          })
        ) : (
          <div className="text-center py-4 text-zinc-500">
            {searchQuery
              ? "No matching contacts found"
              : "No contacts available"}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
