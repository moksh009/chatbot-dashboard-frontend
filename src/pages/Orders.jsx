import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { ShoppingBag, User, DollarSign, Search, Filter, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000'; // Match backend

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();

    // Real-time socket listener
    const newSocket = io(SOCKET_URL, { query: { clientId: 'delitech_smarthomes' } });
    newSocket.on('new_order', (newOrder) => {
        setOrders(prev => [newOrder, ...prev]);
    });

    return () => newSocket.disconnect();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/client/0002/orders');
      setOrders(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => 
    order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.orderId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'success'; // Green
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'shipped': return 'info';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Orders</h2>
          <p className="text-slate-400">Real-time order feed</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-full md:w-64">
            <Input
              icon={Search}
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900/50"
            />
          </div>
          <Button variant="outline" icon={Filter}>Filter</Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-48">
                <Skeleton className="w-full h-full" />
            </Card>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders found"
          description={searchTerm ? "Try adjusting your search terms" : "You haven't received any orders yet"}
        />
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredOrders.map((order) => (
            <motion.div key={order._id} variants={item}>
              <Card className="group hover:border-blue-500/50 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                      <Package size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{order.orderId}</h3>
                      <p className="text-xs text-slate-500">{format(new Date(order.createdAt), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(order.status)}>{order.status}</Badge>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <User size={16} className="text-slate-500" />
                    <span>{order.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <ShoppingBag size={16} className="text-slate-500" />
                    <span>{order.items?.length || 0} items</span>
                  </div>
                   <div className="flex items-center gap-2 text-sm text-slate-300">
                    <DollarSign size={16} className="text-slate-500" />
                    <span className="font-bold text-emerald-400">₹{order.amount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-white/5">
                  <Button className="flex-1 bg-white/5 hover:bg-white/10 text-white border-none">
                    View Details
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Orders;