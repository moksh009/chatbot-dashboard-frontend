import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, TrendingUp, Users, DollarSign, MousePointer, MessageCircle, Phone, ArrowRight } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

const EcommerceDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    leads: { total: 0, newToday: 0 },
    orders: { count: 0, revenue: 0 },
    linkClicks: 0,
    agentRequests: 0
  });
  const [recentLeads, setRecentLeads] = useState([]);

  const fetchDashboardData = async () => {
    try {
      const [realtimeRes, leadsRes] = await Promise.all([
        api.get('/analytics/realtime'),
        api.get('/analytics/leads?limit=5')
      ]);
      
      setStats(realtimeRes.data);
      setRecentLeads(leadsRes.data.leads);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
      setError("Failed to connect to the server. Please check your connection.");
      setLoading(false);
    }
  };

  const fetchRealtimeStats = async () => {
    try {
      const res = await api.get('/analytics/realtime');
      setStats(res.data);
    } catch (err) {
      console.error("Failed to refresh stats", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // --- REAL-TIME SOCKET CONNECTION ---
    const newSocket = io(SOCKET_URL, {
      query: { clientId: user?.clientId || 'delitech_smarthomes' }
    });

    newSocket.on('stats_update', (data) => {
      if (data.type === 'link_click') {
        setStats(prev => ({ ...prev, linkClicks: prev.linkClicks + 1 }));
        fetchRealtimeStats();
      } else if (data.type === 'agent_request') {
        setStats(prev => ({ ...prev, agentRequests: prev.agentRequests + 1 }));
        fetchRealtimeStats();
      } else if (data.type === 'lead_activity') {
        setRecentLeads(prev => {
           // Remove if exists then add to top
           const filtered = prev.filter(l => l._id !== data.lead._id);
           return [data.lead, ...filtered].slice(0, 5);
        });
        // Refresh stats to update total leads count
        fetchRealtimeStats();
      }
    });

    return () => newSocket.disconnect();
  }, [user]);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="h-32">
              <Skeleton className="w-8 h-8 rounded-lg mb-4" />
              <Skeleton className="w-24 h-8 mb-2" />
              <Skeleton className="w-16 h-4" />
            </Card>
          ))}
        </div>
      )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
        <div className="p-4 bg-red-500/10 rounded-full text-red-400">
            <TrendingUp size={32} className="transform rotate-180" />
        </div>
        <div>
            <h3 className="text-xl font-bold text-white mb-2">Oops! Something went wrong</h3>
            <p className="text-slate-400 max-w-md mx-auto">{error}</p>
        </div>
        <Button onClick={() => { setError(null); setLoading(true); fetchDashboardData(); }}>
            Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 md:pb-0">
       {/* Welcome Section */}
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {getTimeGreeting()}, {user?.name || 'Merchant'}
          </h1>
          <p className="text-slate-400 mt-1">Real-time performance metrics.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/campaigns">
            <Button className="bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20">
              <ShoppingBag size={18} className="mr-2" /> New Promo
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* LEADS TODAY */}
        <motion.div variants={item}>
            <Card className="relative overflow-hidden group hover:border-blue-500/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                        <Users size={24} />
                    </div>
                    <span className="flex items-center text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                        +{stats.leads.newToday} Today
                    </span>
                </div>
                <h3 className="text-slate-400 text-sm font-medium">Total Leads</h3>
                <p className="text-2xl font-bold text-white mt-1">{stats.leads.total}</p>
            </Card>
        </motion.div>

        {/* LINK CLICKS */}
        <motion.div variants={item}>
            <Card className="relative overflow-hidden group hover:border-purple-500/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                        <MousePointer size={24} />
                    </div>
                    <span className="flex items-center text-xs font-medium text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full">
                        Live
                    </span>
                </div>
                <h3 className="text-slate-400 text-sm font-medium">Buy Link Clicks</h3>
                <p className="text-2xl font-bold text-white mt-1">{stats.linkClicks}</p>
            </Card>
        </motion.div>

        {/* AGENT REQUESTS */}
        <motion.div variants={item}>
            <Card className="relative overflow-hidden group hover:border-orange-500/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-orange-500/10 rounded-xl text-orange-400 group-hover:bg-orange-500/20 transition-colors">
                        <Phone size={24} />
                    </div>
                </div>
                <h3 className="text-slate-400 text-sm font-medium">Agent Requests</h3>
                <p className="text-2xl font-bold text-white mt-1">{stats.agentRequests}</p>
            </Card>
        </motion.div>

        {/* REVENUE */}
        <motion.div variants={item}>
            <Card className="relative overflow-hidden group hover:border-green-500/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-green-500/10 rounded-xl text-green-400 group-hover:bg-green-500/20 transition-colors">
                        <DollarSign size={24} />
                    </div>
                </div>
                <h3 className="text-slate-400 text-sm font-medium">Revenue (Today)</h3>
                <p className="text-2xl font-bold text-white mt-1">₹{stats.orders.revenue.toLocaleString()}</p>
            </Card>
        </motion.div>
      </motion.div>

      {/* Recent Leads Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Recent Active Leads</h2>
                <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                    View All <ArrowRight size={16} className="ml-2" />
                </Button>
            </div>
            <div className="space-y-4">
                 {recentLeads.length === 0 ? (
                     <p className="text-slate-500 text-sm">No leads active yet.</p>
                 ) : (
                     recentLeads.map((lead) => (
                        <div key={lead._id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                                    <MessageCircle size={20} className="text-slate-400" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-white">{lead.phoneNumber}</h4>
                                    <p className="text-sm text-slate-400 truncate max-w-[200px]">
                                        {lead.chatSummary || 'Started conversation'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${lead.linkClicks > 0 ? 'bg-green-500/10 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                                    {lead.linkClicks > 0 ? `${lead.linkClicks} Clicks` : 'Browsing'}
                                </span>
                                <p className="text-xs text-slate-500 mt-1">
                                    {new Date(lead.lastInteraction).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                                </p>
                            </div>
                        </div>
                     ))
                 )}
            </div>
        </Card>

         <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Orders Today</h2>
            </div>
             <div className="space-y-4">
                 <div className="text-center py-8">
                     <ShoppingBag size={48} className="mx-auto text-slate-700 mb-4" />
                     <p className="text-slate-500">No orders placed today yet.</p>
                 </div>
            </div>
        </Card>
      </div>
    </div>
  );
};

export default EcommerceDashboard;
