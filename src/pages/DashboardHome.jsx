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
    leads: 0,
    birthdays: 0,
    apptReminders: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const analyticsRes = await api.get('/analytics', { params: { days: 28 } });
        const analyticsData = analyticsRes.data;
        
        const totalApps = analyticsData.reduce((acc, curr) => acc + (curr.appointmentsBooked || 0), 0);
        const totalChats = analyticsData.reduce((acc, curr) => acc + (curr.totalChats || 0), 0);
        const birthdays = analyticsData.reduce((acc, curr) => acc + (curr.birthdayRemindersSent || 0), 0);
        const apptReminders = analyticsData.reduce((acc, curr) => acc + (curr.appointmentRemindersSent || 0), 0);
        
        setStats({
          appointments: totalApps,
          activeChats: totalChats,
          leads: analyticsData.reduce((acc, curr) => acc + (curr.uniqueUsers || 0), 0),
          birthdays,
          apptReminders
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
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-24 md:pb-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-1">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            {getTimeGreeting()}, {user?.name || 'Admin'}
          </h1>
          <p className="text-slate-400 text-sm md:text-base mt-1">Here's what's happening in your workspace today.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Link to="/campaigns" className="w-full md:w-auto">
            <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20 justify-center">
              <Plus size={18} className="mr-2" /> New Campaign
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="h-32">
              <Skeleton className="w-8 h-8 rounded-lg mb-4" />
              <Skeleton className="w-16 h-6 mb-2" />
              <Skeleton className="w-12 h-4" />
            </Card>
          ))}
        </div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-6 md:space-y-8"
        >
          {/* Quick Stats - 2 Columns on Mobile, 3 on Desktop */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
            <motion.div variants={item}>
              <Card className="relative overflow-hidden group hover:border-blue-500/30 transition-colors h-full">
                <div className="p-2 w-fit rounded-xl bg-blue-500/10 text-blue-400 mb-3 md:mb-4">
                  <MessageSquare size={20} className="md:w-6 md:h-6" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-1">{stats.activeChats}</h3>
                <p className="text-slate-400 text-xs md:text-sm">Active Chats</p>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="relative overflow-hidden group hover:border-emerald-500/30 transition-colors h-full">
                <div className="p-2 w-fit rounded-xl bg-emerald-500/10 text-emerald-400 mb-3 md:mb-4">
                  <Calendar size={20} className="md:w-6 md:h-6" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-1">{stats.appointments}</h3>
                <p className="text-slate-400 text-xs md:text-sm">Booked</p>
              </Card>
            </motion.div>

            <motion.div variants={item} className="col-span-2 md:col-span-1">
              <Card className="relative overflow-hidden group hover:border-purple-500/30 transition-colors h-full">
                <div className="p-2 w-fit rounded-xl bg-purple-500/10 text-purple-400 mb-3 md:mb-4">
                  <Users size={20} className="md:w-6 md:h-6" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-1">{stats.leads}</h3>
                <p className="text-slate-400 text-xs md:text-sm">Total Leads</p>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-6">
            <motion.div variants={item}>
              <Card className="relative overflow-hidden group hover:border-pink-500/30 transition-colors h-full">
                <div className="p-2 w-fit rounded-xl bg-pink-500/10 text-pink-400 mb-3 md:mb-4">
                  <Calendar size={20} className="md:w-6 md:h-6" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-1">{stats.birthdays}</h3>
                <p className="text-slate-400 text-xs md:text-sm">Birthdays Sent</p>
              </Card>
            </motion.div>
            <motion.div variants={item}>
              <Card className="relative overflow-hidden group hover:border-amber-500/30 transition-colors h-full">
                <div className="p-2 w-fit rounded-xl bg-amber-500/10 text-amber-400 mb-3 md:mb-4">
                  <Clock size={20} className="md:w-6 md:h-6" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-1">{stats.apptReminders}</h3>
                <p className="text-slate-400 text-xs md:text-sm">Reminders Sent</p>
              </Card>
            </motion.div>
          </div>

          {/* Quick Actions & Recent */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={item}>
              <Card className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <Link to="/conversations" className="block">
                    <div className="p-3 md:p-4 rounded-xl bg-slate-900/50 border border-white/5 hover:bg-white/5 transition-all">
                      <MessageSquare size={20} className="text-blue-400 mb-2 md:mb-3" />
                      <h4 className="font-medium text-sm md:text-base text-slate-200">View Chats</h4>
                    </div>
                  </Link>
                  <Link to="/appointments" className="block">
                    <div className="p-3 md:p-4 rounded-xl bg-slate-900/50 border border-white/5 hover:bg-white/5 transition-all">
                      <Calendar size={20} className="text-emerald-400 mb-2 md:mb-3" />
                      <h4 className="font-medium text-sm md:text-base text-slate-200">Schedule</h4>
                    </div>
                  </Link>
                  <Link to="/analytics" className="block">
                    <div className="p-3 md:p-4 rounded-xl bg-slate-900/50 border border-white/5 hover:bg-white/5 transition-all">
                      <BarChart3 size={20} className="text-purple-400 mb-2 md:mb-3" />
                      <h4 className="font-medium text-sm md:text-base text-slate-200">Reports</h4>
                    </div>
                  </Link>
                  <div className="p-3 md:p-4 rounded-xl bg-slate-900/50 border border-white/5 opacity-50">
                    <Clock size={20} className="text-slate-400 mb-2 md:mb-3" />
                    <h4 className="font-medium text-sm md:text-base text-slate-200">More Soon</h4>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Hidden on very small screens to save space, visible on large */}
            <motion.div variants={item} className="hidden lg:block">
              <Card className="h-full">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">System Status</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs text-emerald-400 font-medium">Operational</span>
                  </div>
                </div>
                {/* Status Items */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <div className="flex items-center gap-3">
                      <MessageSquare size={16} className="text-emerald-400" />
                      <span className="text-sm font-medium text-emerald-200">WhatsApp API</span>
                    </div>
                    <span className="text-xs text-emerald-400">Connected</span>
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