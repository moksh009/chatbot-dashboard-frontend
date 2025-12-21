import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { 
  Search, 
  Send, 
  User, 
  Bot, 
  Smartphone, 
  ArrowLeft,
  MessageSquare,
  Clock,
  MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

const LiveChat = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [dateFilter, setDateFilter] = useState('');
  
  const normalizeDigits = (val) => (val || '').replace(/\D/g, '');
  
  const socket = useSocket();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  // ... (Keep existing socket and api logic)
  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('conversation_update', (updatedConversation) => {
        setConversations((prev) => {
          const index = prev.findIndex((c) => c._id === updatedConversation._id);
          let newConversations;
          if (index !== -1) {
            newConversations = [...prev];
            newConversations[index] = updatedConversation;
          } else {
            newConversations = [updatedConversation, ...prev];
          }
          return newConversations.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
        });
        
        if (selectedConversation && selectedConversation._id === updatedConversation._id) {
          setSelectedConversation(updatedConversation);
        }
      });

      socket.on('new_message', (message) => {
        if (selectedConversation && message.conversationId === selectedConversation._id) {
          setMessages((prev) => [...prev, message]);
          scrollToBottom();
        }
      });

      return () => {
        socket.off('conversation_update');
        socket.off('new_message');
      };
    }
  }, [socket, selectedConversation]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
      setIsMobileListVisible(false);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      setLoadingConversations(true);
      const res = await api.get('/conversations');
      setConversations(res.data);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  };

  const fetchMessages = async (id) => {
    try {
      setLoadingMessages(true);
      const res = await api.get(`/conversations/${id}/messages`);
      setMessages(res.data);
      scrollToBottom();
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const res = await api.post(`/conversations/${selectedConversation._id}/messages`, {
        content: newMessage,
      });
      setNewMessage('');
      if (res?.data) {
        setMessages((prev) => [...prev, res.data]);
        scrollToBottom();
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleTakeover = async () => {
    if (!selectedConversation) return;
    try {
      const res = await api.put(`/conversations/${selectedConversation._id}/takeover`);
      setSelectedConversation(res.data);
    } catch (err) {
      console.error('Error taking over conversation:', err);
    }
  };
  
  const handleRelease = async () => {
    if (!selectedConversation) return;
    try {
      const res = await api.put(`/conversations/${selectedConversation._id}/release`);
      setSelectedConversation(res.data);
    } catch (err) {
      console.error('Error releasing conversation:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredConversations = conversations.filter(c => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    const phoneDigits = normalizeDigits(c.phone);
    const termDigits = normalizeDigits(term);
    const matchPhone = termDigits ? phoneDigits.includes(termDigits) : false;
    const matchMsg = (c.lastMessage || '').toLowerCase().includes(term);
    return matchPhone || matchMsg;
  }).filter(c => {
    if (!dateFilter) return true;
    const days = parseInt(dateFilter, 10);
    if (isNaN(days)) return true;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const last = c.lastMessageAt ? new Date(c.lastMessageAt) : null;
    return last && last >= cutoff;
  });

  return (
    <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] flex flex-col md:flex-row gap-4 overflow-hidden">
      {/* Conversation List Sidebar */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={clsx(
          "w-full md:w-96 flex flex-col glass-card rounded-2xl overflow-hidden",
          !isMobileListVisible && "hidden md:flex"
        )}
      >
        <div className="p-4 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl z-10">
          <h2 className="text-lg font-bold text-white mb-4">Messages</h2>
          
          {/* Date Filter Pills */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { label: 'Today', value: '1' },
              { label: '7d', value: '7' },
              { label: '14d', value: '14' },
              { label: '30d', value: '30' },
              { label: 'All', value: '' },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setDateFilter(filter.value)}
                className={clsx(
                  "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all border",
                  dateFilter === filter.value
                    ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/20"
                    : "bg-slate-800 text-slate-400 border-white/5 hover:bg-slate-700 hover:text-slate-200"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-white/5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:bg-slate-800 transition-all text-sm"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loadingConversations ? (
            <div className="p-4 space-y-4">
               {[...Array(8)].map((_, i) => (
                 <div key={i} className="flex items-center gap-3">
                   <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                   <div className="flex-1 space-y-2">
                     <Skeleton className="h-4 w-3/4" />
                     <Skeleton className="h-3 w-1/2" />
                   </div>
                 </div>
               ))}
            </div>
          ) : (
            <>
              <AnimatePresence>
                {filteredConversations.map((conv) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={conv._id}
                    onClick={() => setSelectedConversation(conv)}
                    className={clsx(
                      "p-4 cursor-pointer transition-all duration-200 border-b border-white/5 hover:bg-white/5 relative overflow-hidden group",
                      selectedConversation?._id === conv._id && "bg-blue-500/10"
                    )}
                  >
                    {selectedConversation?._id === conv._id && (
                      <motion.div 
                        layoutId="activeConv"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" 
                      />
                    )}
                    
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-slate-300 shadow-inner group-hover:scale-105 transition-transform">
                          <User size={18} />
                        </div>
                        <div>
                          <p className={clsx("font-semibold text-sm", selectedConversation?._id === conv._id ? "text-white" : "text-slate-300")}>
                            {conv.phone}
                          </p>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Clock size={10} />
                            {format(new Date(conv.lastMessageAt), 'h:mm a')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pl-[52px]">
                      <p className="text-xs text-slate-400 truncate group-hover:text-slate-300 transition-colors">
                        {conv.lastMessage}
                      </p>
                      {conv.status === 'HUMAN_TAKEOVER' && (
                        <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 text-[10px] px-2 py-0.5 rounded-full mt-2 font-medium border border-amber-500/20">
                          <User size={10} /> Agent Active
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {filteredConversations.length === 0 && (
                <EmptyState 
                  icon={MessageSquare}
                  title="No conversations found"
                  description="Try adjusting your search terms."
                  className="py-12"
                />
              )}
            </>
          )}
        </div>
      </motion.div>

      {/* Chat Area */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className={clsx(
          "flex-1 flex flex-col glass-card rounded-2xl overflow-hidden relative",
          isMobileListVisible && "hidden md:flex"
        )}
      >
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 flex justify-between items-center z-20">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsMobileListVisible(true)}
                  className="md:hidden p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      {selectedConversation.phone}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <span className={clsx(
                        "w-1.5 h-1.5 rounded-full animate-pulse",
                        selectedConversation.status === 'HUMAN_TAKEOVER' ? "bg-amber-500" : "bg-emerald-500"
                      )} />
                      {selectedConversation.status === 'HUMAN_TAKEOVER' ? 'Agent Active' : 'Bot Active'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="h-6 w-px bg-white/10 mx-2" />
                
                {selectedConversation.status === 'BOT_ACTIVE' ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleTakeover}
                    className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
                  >
                    <User size={14} className="mr-2" /> Take Over
                  </Button>
                ) : (
                  <Button 
                    variant="default"
                    size="sm"
                    onClick={handleRelease}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-lg shadow-emerald-900/20"
                  >
                    <Bot size={14} className="mr-2" /> Resume Bot
                  </Button>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-950/30">
              {loadingMessages ? (
                 <div className="space-y-6">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={clsx("flex w-full", i % 2 === 0 ? "justify-start" : "justify-end")}>
                         <Skeleton className={clsx("h-16 rounded-2xl", i % 2 === 0 ? "w-2/3" : "w-1/2")} />
                      </div>
                    ))}
                 </div>
              ) : (
                <>
                  {messages.map((msg, index) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      key={index}
                      className={clsx(
                        "flex w-full",
                        msg.direction === 'outgoing' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div className={clsx(
                        "max-w-[85%] md:max-w-[70%] rounded-2xl px-5 py-3 shadow-md relative group transition-all",
                        msg.direction === 'outgoing'
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-slate-800 text-slate-200 border border-white/5 rounded-bl-none"
                      )}>
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        <span className={clsx(
                          "text-[10px] absolute -bottom-5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap",
                          msg.direction === 'outgoing' ? "right-0 text-slate-500" : "left-0 text-slate-500"
                        )}>
                          {format(new Date(msg.timestamp || Date.now()), 'h:mm a')}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-slate-900/80 backdrop-blur-xl border-t border-white/5">
              <form onSubmit={sendMessage} className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={selectedConversation.status === 'BOT_ACTIVE' ? "Take over to start typing..." : "Type a message..."}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/5 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 text-slate-200 placeholder:text-slate-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={selectedConversation.status === 'BOT_ACTIVE'}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={selectedConversation.status === 'BOT_ACTIVE' || !newMessage.trim()}
                  className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/20"
                >
                  <Send size={20} />
                </motion.button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center h-full">
            <EmptyState 
              icon={Smartphone}
              title="Select a Conversation"
              description="Choose a conversation from the list to start chatting or monitoring bot interactions."
              className="max-w-md mx-auto"
            />
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LiveChat;
