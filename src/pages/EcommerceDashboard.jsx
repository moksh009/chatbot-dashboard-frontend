import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, TrendingUp, Users, DollarSign, ShoppingCart, ArrowRight } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const EcommerceDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    orders: 0,
    abandonedCarts: 0,
    conversionRate: 0
  });

  useEffect(() => {
    // Simulate fetching ecommerce data
    const timer = setTimeout(() => {
      setStats({
        totalRevenue: 124500,
        orders: 142,
        abandonedCarts: 24,
        conversionRate: 3.2
      });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
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

  return (
    <div className="space-y-8 pb-20 md:pb-0">
       {/* Welcome Section */}
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {getTimeGreeting()}, {user?.name || 'Merchant'}
          </h1>
          <p className="text-slate-400 mt-1">Here is your store's performance today.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/campaigns">
            <Button className="bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20">
              <ShoppingBag size={18} className="mr-2" /> New Product Promo
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
        <motion.div variants={item}>
            <Card className="relative overflow-hidden group hover:border-blue-500/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-green-500/10 rounded-xl text-green-400 group-hover:bg-green-500/20 transition-colors">
                        <DollarSign size={24} />
                    </div>
                    <span className="flex items-center text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                        +12% <TrendingUp size={12} className="ml-1" />
                    </span>
                </div>
                <h3 className="text-slate-400 text-sm font-medium">Total Revenue</h3>
                <p className="text-2xl font-bold text-white mt-1">₹{stats.totalRevenue.toLocaleString()}</p>
            </Card>
        </motion.div>

        <motion.div variants={item}>
            <Card className="relative overflow-hidden group hover:border-blue-500/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                        <ShoppingBag size={24} />
                    </div>
                </div>
                <h3 className="text-slate-400 text-sm font-medium">Total Orders</h3>
                <p className="text-2xl font-bold text-white mt-1">{stats.orders}</p>
            </Card>
        </motion.div>

        <motion.div variants={item}>
            <Card className="relative overflow-hidden group hover:border-blue-500/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-orange-500/10 rounded-xl text-orange-400 group-hover:bg-orange-500/20 transition-colors">
                        <ShoppingCart size={24} />
                    </div>
                     <span className="flex items-center text-xs font-medium text-red-400 bg-red-500/10 px-2 py-1 rounded-full">
                        Needs Action
                    </span>
                </div>
                <h3 className="text-slate-400 text-sm font-medium">Abandoned Carts</h3>
                <p className="text-2xl font-bold text-white mt-1">{stats.abandonedCarts}</p>
            </Card>
        </motion.div>

        <motion.div variants={item}>
            <Card className="relative overflow-hidden group hover:border-blue-500/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                        <Users size={24} />
                    </div>
                </div>
                <h3 className="text-slate-400 text-sm font-medium">Conversion Rate</h3>
                <p className="text-2xl font-bold text-white mt-1">{stats.conversionRate}%</p>
            </Card>
        </motion.div>
      </motion.div>

      {/* Recent Orders / Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Recent Orders</h2>
                <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                    View All <ArrowRight size={16} className="ml-2" />
                </Button>
            </div>
            <div className="space-y-4">
                 {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                                <ShoppingBag size={20} className="text-slate-400" />
                            </div>
                            <div>
                                <h4 className="font-medium text-white">Order #102{i}</h4>
                                <p className="text-sm text-slate-400">2 items • ₹2,400</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium">
                                Paid
                            </span>
                            <p className="text-xs text-slate-500 mt-1">Just now</p>
                        </div>
                    </div>
                 ))}
            </div>
        </Card>

         <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Abandoned Carts Recovery</h2>
            </div>
             <div className="space-y-4">
                 {[1, 2].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                <ShoppingCart size={20} className="text-orange-400" />
                            </div>
                            <div>
                                <h4 className="font-medium text-white">Pending Recovery</h4>
                                <p className="text-sm text-slate-400">User ending in **88</p>
                            </div>
                        </div>
                         <Button size="sm" className="bg-green-600 hover:bg-green-500">
                             Send WhatsApp
                         </Button>
                    </div>
                 ))}
            </div>
        </Card>
      </div>
    </div>
  );
};

export default EcommerceDashboard;
