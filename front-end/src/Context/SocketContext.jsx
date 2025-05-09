import { createContext, useContext, useEffect, useState } from "react"
import { useAuthStore } from "../store/useAuthStore";
import { io } from "socket.io-client";

const SocketContext = createContext()

export const useSocketContext = () => {
  return useContext(SocketContext);
}

export const SocketProvider = ({children}) => {
  const [socket,setSocket] = useState(null)
  const [onlineUser,setOnlineUser] = useState([])
  const {authUser} = useAuthStore()

  useEffect(()=>{
    if(authUser){
      const socket = io("https://fullstack-chat-app-qvkj.onrender.com", {
        query: {
          userId: authUser?._id,
        },
      });
      socket.on("getOnlineUsers",(users)=>{
        setOnlineUser(users)
      });
      setSocket(socket);
      return()=>socket.close()
    }else{
      if(socket){
        socket.close()
        setSocket(null)
      }
    }
  },[authUser])

  return (
    <SocketContext.Provider value={{ socket, onlineUser }}>
      {children}
    </SocketContext.Provider>
  );
}
