import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (user && user.clientId) {
      const url = import.meta.env.VITE_SOCKET_URL 
        || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
      const newSocket = io(url, {
        query: { clientId: user.clientId }
      });
      
      newSocket.on('connect', () => {
        console.log('Connected to socket server');
      });

      setSocket(newSocket);

      return () => newSocket.close();
    } else {
        if(socket) {
            socket.close();
            setSocket(null);
        }
    }
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
