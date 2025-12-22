import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (user && user.clientId) {
      let url = import.meta.env.VITE_SOCKET_URL;
      if (!url) {
        const base = api?.defaults?.baseURL;
        if (base) {
          try {
            url = new URL(base).origin;
          } catch {
            url = base.replace(/\/api$/, '');
          }
        } else {
          url = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
        }
      }
      try {
        fetch(`${url}/keepalive-ping`, { method: 'POST' }).catch(() => {});
      } catch {}
      const newSocket = io(url, {
        path: '/socket.io',
        transports: ['websocket'],
        query: { clientId: user.clientId },
        timeout: 10000,
        reconnectionAttempts: 5,
        reconnectionDelay: 500,
        reconnectionDelayMax: 2000
      });
      
      newSocket.on('connect', () => {
        console.log('Connected to socket server');
      });

      setSocket(newSocket);

      return () => newSocket.close();
    } else {
      if (socket) {
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
