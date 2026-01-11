import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { ShoppingBag, Clock, User, DollarSign, Trash2, Search, Filter, AlertCircle, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // Try to fetch from API, fallback to mock if fails
      // const res = await api.get('/orders');
      // setOrders(res.data);
      
      // Mock data for now as backend might not be ready
      setTimeout(() => {
        setOrders([
            { _id: '1', orderId: '#ORD-001', customer: 'John Doe', amount: 1200, status: 'completed', date: new Date().toISOString(), items: 3 },
            { _id: '2', orderId: '#ORD-002', customer: 'Jane Smith', amount: 850, status: 'pending', date: new Date().toISOString(), items: 1 },
            { _id: '3', orderId: '#ORD-003', customer: 'Alice Johnson', amount: 2300, status: 'shipped', date: new Date(Date.now() - 86400000).toISOString(), items: 5 },
        ]);
        setLoading(false);
      }, 1000);

    } catch (err) {
      console.error('Error fetching orders:', err);
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => 
    order.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.orderId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'shipped': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Orders</h2>
          <p className="text-slate-400">Manage your store orders</p>
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
              <div className="flex justify-between items-start mb-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <Skeleton className="w-20 h-6 rounded-full" />
              </div>
              <Skeleton className="w-3/4 h-6 mb-2" />
              <Skeleton className="w-1/2 h-4 mb-4" />
              <Skeleton className="w-full h-10 rounded-lg" />
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
                      <p className="text-xs text-slate-500">{format(new Date(order.date), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(order.status)}>{order.status}</Badge>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <User size={16} className="text-slate-500" />
                    <span>{order.customer}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <ShoppingBag size={16} className="text-slate-500" />
                    <span>{order.items} items</span>
                  </div>
                   <div className="flex items-center gap-2 text-sm text-slate-300">
                    <DollarSign size={16} className="text-slate-500" />
                    <span>₹{order.amount.toLocaleString()}</span>
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
