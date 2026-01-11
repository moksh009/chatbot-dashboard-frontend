import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, TrendingUp, Users, DollarSign, 
  MousePointer, MessageCircle, Phone, ArrowRight, 
  Plus, AlertCircle 
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000'; // Match your backend URL

const EcommerceDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [stats, setStats] = useState({
    leads: { total: 0, newToday: 0 },
    orders: { count: 0, revenue: 0 },
    linkClicks: 0,
    agentRequests: 0,
    addToCarts: 0
  });
  
  const [recentLeads, setRecentLeads] = useState([]);

  // --- DATA FETCHING ---
  const fetchDashboardData = async () => {
    try {
      // Determine client ID for API calls
      const clientId = user?.clientId === 'code_clinic_v1' || !user?.clientId 
        ? 'delitech_smarthomes' // Default for dev
        : user.clientId;

      // Parallel fetch
      const [realtimeRes, leadsRes] = await Promise.all([
        api.get('/analytics/realtime', { params: { clientId } }),
        api.get('/analytics/leads', { params: { clientId, limit: 5 } })
      ]);
      
      setStats(realtimeRes.data);
      setRecentLeads(leadsRes.data.leads || []);
      setLoading(false);
    } catch (err) {
      console.error("Dashboard Load Error:", err);
      // Don't block UI entirely if just one fails, but show error state if critical
      if (loading) {
          setError("Unable to load live metrics.");
          setLoading(false);
      }
    }
  };

  const fetchRealtimeStats = async () => {
    try {
        const clientId = user?.clientId || 'delitech_smarthomes';
        const res = await api.get('/analytics/realtime', { params: { clientId } });
        setStats(res.data);
    } catch (err) { console.error("Stats refresh failed", err); }
  };

  // --- EFFECT: Initial Load & Socket ---
  useEffect(() => {
    fetchDashboardData();

    // Polling Backup (30s)
    const intervalId = setInterval(() => {
        fetchRealtimeStats();
        // Refresh leads list quietly
        const clientId = user?.clientId || 'delitech_smarthomes';
        api.get('/analytics/leads', { params: { clientId, limit: 5 } })
           .then(res => setRecentLeads(res.data.leads || []))
           .catch(e => console.error(e));
    }, 30000);

    // Socket Connection
    const socketClientId = (user?.clientId === 'code_clinic_v1' || !user?.clientId) 
        ? 'delitech_smarthomes' 
        : user.clientId;

    const newSocket = io(SOCKET_URL, { query: { clientId: socketClientId } });

    newSocket.on('stats_update', (data) => {
      // Optimistic Updates
      if (data.type === 'link_click') {
        setStats(prev => ({ ...prev, linkClicks: prev.linkClicks + 1 }));
      } else if (data.type === 'add_to_cart') {
        setStats(prev => ({ ...prev, addToCarts: prev.addToCarts + 1 }));
      } else if (data.type === 'agent_request') {
        setStats(prev => ({ ...prev, agentRequests: prev.agentRequests + 1 }));
      }
      // Always refresh to stay perfectly synced
      fetchRealtimeStats();
    });

    newSocket.on('new_lead', (lead) => {
        setRecentLeads(prev => [lead, ...prev].slice(0, 5));
        fetchRealtimeStats();
    });

    return () => {
        newSocket.disconnect();
        clearInterval(intervalId);
    };
  }, [user]);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Animation Variants
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  // --- LOADING STATE ---
  if (loading) {
      return (
        <div className="space-y-6">
            <div className="h-20 bg-slate-900/50 rounded-xl animate-pulse" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="h-32 bg-slate-900/50 border-white/5">
                        <Skeleton className="w-10 h-10 rounded-lg mb-4 bg-slate-800" />
                        <Skeleton className="w-24 h-6 mb-2 bg-slate-800" />
                        <Skeleton className="w-16 h-4 bg-slate-800" />
                    </Card>
                ))}
            </div>
        </div>
      )
  }

  // --- ERROR STATE ---
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
        <div className="p-4 bg-red-500/10 rounded-full text-red-400 border border-red-500/20">
            <AlertCircle size={32} />
        </div>
        <div>
            <h3 className="text-xl font-bold text-white mb-2">Dashboard Error</h3>
            <p className="text-slate-400 max-w-md mx-auto mb-6">{error}</p>
            <Button onClick={() => { setError(null); setLoading(true); fetchDashboardData(); }} className="bg-slate-800 hover:bg-slate-700">
                Retry Connection
            </Button>
        </div>
      </div>
    );
  }

  // --- MAIN RENDER ---
  return (
    <div className="space-y-6 md:space-y-8 pb-24 md:pb-8">
       
       {/* 1. HEADER SECTION */}
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-1">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            {getTimeGreeting()}, {user?.name || 'Merchant'}
          </h1>
          <p className="text-slate-400 text-sm md:text-base mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Store Performance
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Link to="/campaigns" className="w-full md:w-auto">
            <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 border-none">
              <Plus size={18} className="mr-2" /> New Promo
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. STATS GRID */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6"
      >
        {/* Total Leads */}
        <motion.div variants={item}>
            <Link to="/analytics">
                <Card className="relative overflow-hidden group hover:border-blue-500/30 transition-all cursor-pointer h-full">
                    <div className="flex justify-between items-start mb-3 md:mb-4">
                        <div className="p-2 md:p-3 bg-blue-500/10 rounded-xl text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                            <Users size={20} className="md:w-6 md:h-6" />
                        </div>
                        <span className="hidden md:flex items-center text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                            +{stats.leads.newToday} Today
                        </span>
                    </div>
                    <h3 className="text-slate-400 text-xs md:text-sm font-medium uppercase tracking-wide">Total Leads</h3>
                    <p className="text-2xl md:text-3xl font-bold text-white mt-1">{stats.leads.total}</p>
                </Card>
            </Link>
        </motion.div>

        {/* Link Clicks */}
        <motion.div variants={item}>
            <Link to="/analytics">
                <Card className="relative overflow-hidden group hover:border-purple-500/30 transition-all cursor-pointer h-full">
                    <div className="flex justify-between items-start mb-3 md:mb-4">
                        <div className="p-2 md:p-3 bg-purple-500/10 rounded-xl text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                            <MousePointer size={20} className="md:w-6 md:h-6" />
                        </div>
                    </div>
                    <h3 className="text-slate-400 text-xs md:text-sm font-medium uppercase tracking-wide">Buy Link Clicks</h3>
                    <p className="text-2xl md:text-3xl font-bold text-white mt-1">{stats.linkClicks}</p>
                </Card>
            </Link>
        </motion.div>

        {/* Agent Requests */}
        <motion.div variants={item}>
            <Card className="relative overflow-hidden group hover:border-red-500/30 transition-all h-full">
                <div className="flex justify-between items-start mb-3 md:mb-4">
                    <div className="p-2 md:p-3 bg-red-500/10 rounded-xl text-red-400 group-hover:bg-red-500/20 transition-colors">
                        <Phone size={20} className="md:w-6 md:h-6" />
                    </div>
                </div>
                <h3 className="text-slate-400 text-xs md:text-sm font-medium uppercase tracking-wide">Agent Requests</h3>
                <p className="text-2xl md:text-3xl font-bold text-white mt-1">{stats.agentRequests}</p>
            </Card>
        </motion.div>

        {/* Revenue */}
        <motion.div variants={item}>
            <Card className="relative overflow-hidden group hover:border-emerald-500/30 transition-all h-full">
                <div className="flex justify-between items-start mb-3 md:mb-4">
                    <div className="p-2 md:p-3 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                        <DollarSign size={20} className="md:w-6 md:h-6" />
                    </div>
                </div>
                <h3 className="text-slate-400 text-xs md:text-sm font-medium uppercase tracking-wide">Revenue (Today)</h3>
                <p className="text-2xl md:text-3xl font-bold text-white mt-1">₹{stats.orders.revenue.toLocaleString()}</p>
            </Card>
        </motion.div>
      </motion.div>

      {/* 3. DETAILED SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Active Leads */}
        <Card className="p-0 overflow-hidden flex flex-col h-full">
            <div className="p-5 md:p-6 border-b border-white/5 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-white">Live Activity</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Recent bot interactions</p>
                </div>
                <Link to="/analytics">
                    <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                        View All <ArrowRight size={16} className="ml-1.5" />
                    </Button>
                </Link>
            </div>
            
            <div className="p-4 md:p-6 space-y-3 md:space-y-4">
                 {recentLeads.length === 0 ? (
                     <div className="text-center py-10">
                        <MessageCircle size={32} className="mx-auto text-slate-700 mb-3" />
                        <p className="text-slate-500 text-sm">No activity recorded yet.</p>
                     </div>
                 ) : (
                     recentLeads.map((lead) => (
                         <div key={lead._id} className="group flex items-center justify-between p-3 md:p-4 rounded-xl bg-slate-900/50 border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all">
                             <div className="flex items-center gap-3 md:gap-4">
                                 <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/5 group-hover:border-white/10">
                                     <MessageCircle size={18} className="text-slate-400" />
                                 </div>
                                 <div>
                                     <Link to={`/conversations?phone=${lead.phoneNumber}`} className="font-semibold text-sm md:text-base text-white hover:text-blue-400 transition-colors">
                                        {lead.phoneNumber}
                                     </Link>
                                     <p className="text-xs md:text-sm text-slate-400 truncate max-w-[140px] md:max-w-[200px]">
                                         {lead.chatSummary || 'Interested in products'}
                                     </p>
                                 </div>
                             </div>
                             <div className="text-right">
                                 {lead.linkClicks > 0 && (
                                     <span className="inline-flex mb-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                                         {lead.linkClicks} Clicks
                                     </span>
                                 )}
                                 <p className="text-[10px] md:text-xs text-slate-500 mt-0.5">
                                     {new Date(lead.lastInteraction).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                                 </p>
                             </div>
                         </div>
                      ))
                  )}
             </div>
         </Card>

         {/* Orders Today (Placeholder for now) */}
         <Card className="p-0 overflow-hidden flex flex-col h-full">
            <div className="p-5 md:p-6 border-b border-white/5">
                <h2 className="text-lg font-bold text-white">Orders Today</h2>
                <p className="text-xs text-slate-400 mt-0.5">Real-time sales feed</p>
            </div>
             <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                 <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mb-4">
                    <ShoppingBag size={28} className="text-slate-600" />
                 </div>
                 <h3 className="text-slate-300 font-medium mb-1">No orders yet</h3>
                 <p className="text-slate-500 text-sm max-w-xs mx-auto">
                    Orders will appear here instantly when a purchase is made on your store.
                 </p>
            </div>
        </Card>
      </div>
    </div>
  );
};

export default EcommerceDashboard;