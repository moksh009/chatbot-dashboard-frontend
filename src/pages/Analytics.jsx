import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Users, MessageSquare, Calendar, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import clsx from 'clsx';

const Analytics = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchStats();
  }, [days]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/analytics', { params: { days } });
      // Sort by date ascending for the chart
      const sortedData = res.data.sort((a, b) => new Date(a.date) - new Date(b.date));
      setStats(sortedData);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const totals = stats.reduce((acc, curr) => ({
    chats: acc.chats + (curr.totalChats || 0),
    users: acc.users + (curr.uniqueUsers || 0),
    appointments: acc.appointments + (curr.appointmentsBooked || 0),
    messages: acc.messages + (curr.totalMessagesExchanged || 0),
    birthdays: acc.birthdays + (curr.birthdayRemindersSent || 0),
    apptReminders: acc.apptReminders + (curr.appointmentRemindersSent || 0)
  }), { chats: 0, users: 0, appointments: 0, messages: 0, birthdays: 0, apptReminders: 0 });

  const metrics = [
    {
      label: 'Total Chats',
      value: totals.chats,
      icon: MessageSquare,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      trend: '+12.5%',
      trendUp: true
    },
    {
      label: 'Unique Users',
      value: totals.users,
      icon: Users,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
      trend: '+8.2%',
      trendUp: true
    },
    {
      label: 'Appointments',
      value: totals.appointments,
      icon: Calendar,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      trend: '-2.4%',
      trendUp: false
    },
    {
      label: 'Messages',
      value: totals.messages.toLocaleString(),
      icon: TrendingUp,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      trend: '+24.3%',
      trendUp: true
    },
    {
      label: 'Birthday Wishes',
      value: totals.birthdays,
      icon: Calendar,
      color: 'text-pink-400',
      bg: 'bg-pink-500/10',
      border: 'border-pink-500/20',
      trend: '+0.0%',
      trendUp: true
    },
    {
      label: 'Appointment Reminders',
      value: totals.apptReminders,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      trend: '+0.0%',
      trendUp: true
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-xl">
          <p className="text-slate-400 text-xs mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm mb-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-300">{entry.name}:</span>
              <span className="text-white font-medium">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics Overview</h2>
          <p className="text-slate-400">Performance metrics for the last 30 days</p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            className="bg-slate-900 border border-white/10 text-slate-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none"
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value, 10))}
          >
            <option value={7}>Last 7 Days</option>
            <option value={28}>Last 28 Days</option>
            <option value={30}>Last 30 Days</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="h-32">
                <div className="flex justify-between items-start mb-4">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <Skeleton className="w-12 h-4" />
                </div>
                <Skeleton className="w-24 h-8 mb-2" />
                <Skeleton className="w-16 h-4" />
              </Card>
            ))}
          </div>
          <Card className="h-96">
            <Skeleton className="w-full h-full rounded-xl" />
          </Card>
        </div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, index) => (
              <motion.div variants={item} key={index}>
                <Card className="relative overflow-hidden group hover:border-white/10 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className={clsx("p-2.5 rounded-xl transition-transform group-hover:scale-110", metric.bg, metric.color)}>
                      <metric.icon size={20} />
                    </div>
                    <div className={clsx(
                      "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border",
                      metric.trendUp 
                        ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" 
                        : "text-red-400 border-red-500/20 bg-red-500/10"
                    )}>
                      {metric.trendUp ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                      {metric.trend}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-bold text-white tracking-tight">{metric.value}</h3>
                    <p className="text-sm text-slate-500">{metric.label}</p>
                  </div>
                  
                  {/* Decorative Gradient */}
                  <div className={clsx(
                    "absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500",
                    metric.color.replace('text-', 'bg-')
                  )} />
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Main Chart */}
          <motion.div variants={item}>
            <Card className="h-[400px] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">Engagement Trends</h3>
                  <p className="text-sm text-slate-400">Chats vs Messages over time</p>
                </div>
              </div>
              
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorChats" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorMsgs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#64748b" 
                      fontSize={12} 
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={12} 
                      tickLine={false}
                      axisLine={false}
                      dx={-10}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="totalChats" 
                      name="Chats"
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorChats)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="totalMessagesExchanged" 
                      name="Messages"
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorMsgs)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>

          {/* Recent Activity Table (Simplified) */}
          <motion.div variants={item}>
            <Card className="overflow-hidden" noPadding>
              <div className="px-6 py-4 border-b border-white/5">
                <h3 className="text-lg font-semibold text-white">Detailed Report</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/5">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Chats</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Users</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Appointments</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Messages</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {stats.slice().reverse().slice(0, 5).map((stat) => (
                      <tr key={stat._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 font-medium">{stat.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{stat.totalChats}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{stat.uniqueUsers}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                          <span className={clsx(
                            "px-2 py-0.5 rounded-full text-xs font-medium",
                            stat.appointmentsBooked > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-500"
                          )}>
                            {stat.appointmentsBooked}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{stat.totalMessagesExchanged}</td>
                      </tr>
                    ))}
                    {stats.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                          No analytics data available yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Analytics;
