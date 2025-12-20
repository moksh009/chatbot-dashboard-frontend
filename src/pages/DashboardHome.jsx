import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, Calendar, BarChart3, ArrowRight, Plus, Users, Clock } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const DashboardHome = () => {
  const [stats, setStats] = useState({
    appointments: 0,
    activeChats: 0,
    leads: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Parallel fetch for dashboard data
        // Note: Using existing endpoints or mocking if specific dashboard endpoint doesn't exist
        // Assuming /analytics exists from Analytics page analysis
        const analyticsRes = await api.get('/analytics');
        const analyticsData = analyticsRes.data;
        
        // Calculate basic stats from analytics data (mock logic based on available data)
        const totalApps = analyticsData.reduce((acc, curr) => acc + (curr.appointmentsBooked || 0), 0);
        const totalChats = analyticsData.reduce((acc, curr) => acc + (curr.totalChats || 0), 0);
        
        setStats({
          appointments: totalApps,
          activeChats: totalChats, // This would ideally be real-time active chats
          leads: analyticsData.reduce((acc, curr) => acc + (curr.uniqueUsers || 0), 0)
        });
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {getTimeGreeting()}, {user?.name || 'Admin'}
          </h1>
          <p className="text-slate-400 mt-1">Here's what's happening in your workspace today.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/campaigns">
            <Button className="bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20">
              <Plus size={18} className="mr-2" /> New Campaign
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="h-32">
              <Skeleton className="w-8 h-8 rounded-lg mb-4" />
              <Skeleton className="w-24 h-8 mb-2" />
              <Skeleton className="w-16 h-4" />
            </Card>
          ))}
        </div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div variants={item}>
              <Card className="relative overflow-hidden group hover:border-blue-500/30 transition-colors">
                <div className="p-2 w-fit rounded-xl bg-blue-500/10 text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                  <MessageSquare size={24} />
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">{stats.activeChats}</h3>
                <p className="text-slate-400 text-sm">Active Conversations</p>
                <div className="absolute right-0 bottom-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight size={20} className="text-blue-400 -rotate-45" />
                </div>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                <div className="p-2 w-fit rounded-xl bg-emerald-500/10 text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                  <Calendar size={24} />
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">{stats.appointments}</h3>
                <p className="text-slate-400 text-sm">Appointments Booked</p>
                <div className="absolute right-0 bottom-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight size={20} className="text-emerald-400 -rotate-45" />
                </div>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="relative overflow-hidden group hover:border-purple-500/30 transition-colors">
                <div className="p-2 w-fit rounded-xl bg-purple-500/10 text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                  <Users size={24} />
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">{stats.leads}</h3>
                <p className="text-slate-400 text-sm">Total Leads</p>
                <div className="absolute right-0 bottom-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight size={20} className="text-purple-400 -rotate-45" />
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Quick Actions & Recent */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={item}>
              <Card className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Link to="/conversations" className="block">
                    <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer group">
                      <MessageSquare size={20} className="text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
                      <h4 className="font-medium text-slate-200">View Chats</h4>
                      <p className="text-xs text-slate-500 mt-1">Reply to customers</p>
                    </div>
                  </Link>
                  <Link to="/appointments" className="block">
                    <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer group">
                      <Calendar size={20} className="text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
                      <h4 className="font-medium text-slate-200">Schedule</h4>
                      <p className="text-xs text-slate-500 mt-1">Check appointments</p>
                    </div>
                  </Link>
                  <Link to="/analytics" className="block">
                    <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer group">
                      <BarChart3 size={20} className="text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
                      <h4 className="font-medium text-slate-200">Reports</h4>
                      <p className="text-xs text-slate-500 mt-1">View insights</p>
                    </div>
                  </Link>
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer group opacity-50">
                    <Clock size={20} className="text-slate-400 mb-3" />
                    <h4 className="font-medium text-slate-200">Coming Soon</h4>
                    <p className="text-xs text-slate-500 mt-1">More features</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="h-full">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">System Status</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs text-emerald-400 font-medium">Operational</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                        <MessageSquare size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-emerald-200">WhatsApp API</p>
                        <p className="text-xs text-emerald-500/60">Connected</p>
                      </div>
                    </div>
                    <span className="text-xs text-emerald-400">99.9% Uptime</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                        <Users size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-200">Bot Engine</p>
                        <p className="text-xs text-blue-500/60">Active</p>
                      </div>
                    </div>
                    <span className="text-xs text-blue-400">Running</span>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-slate-900 border border-white/5 mt-4">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Storage Usage</h4>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-1">
                      <div className="h-full w-[45%] bg-indigo-500 rounded-full" />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>4.5 GB used</span>
                      <span>10 GB total</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DashboardHome;
