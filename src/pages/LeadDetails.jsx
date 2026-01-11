import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  User, Phone, Calendar, ShoppingCart, CreditCard, 
  MessageSquare, ArrowLeft, Activity, MousePointer,
  Package
} from 'lucide-react';
import { motion } from 'framer-motion';

const LeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeadDetails();
  }, [id]);

  const fetchLeadDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/api/analytics/lead/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching lead details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-white p-8">Loading...</div>;
  if (!data) return <div className="text-white p-8">Lead not found</div>;

  const { lead, orders, conversation } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <User className="w-6 h-6 text-blue-500" />
            {lead.name || lead.phoneNumber}
          </h1>
          <p className="text-slate-400 text-sm">Lead Details & Activity Log</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Profile & Stats */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Profile</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-300">
                <Phone className="w-5 h-5 text-slate-500" />
                <span>{lead.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Calendar className="w-5 h-5 text-slate-500" />
                <span>First Seen: {new Date(lead.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Activity className="w-5 h-5 text-slate-500" />
                <span>Last Active: {new Date(lead.lastInteraction).toLocaleString()}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-800">
                <p className="text-sm text-slate-400 mb-2">Summary</p>
                <p className="text-slate-200 text-sm bg-slate-800/50 p-3 rounded-lg">
                  {lead.chatSummary || "No summary available."}
                </p>
              </div>
            </div>
          </div>

          {/* Engagement Stats */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Engagement</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 p-3 rounded-lg text-center">
                <MousePointer className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{lead.linkClicks || 0}</div>
                <div className="text-xs text-slate-400">Link Clicks</div>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-lg text-center">
                <ShoppingCart className="w-5 h-5 text-orange-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{lead.addToCartCount || 0}</div>
                <div className="text-xs text-slate-400">Add to Carts</div>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-lg text-center">
                <Package className="w-5 h-5 text-green-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{lead.ordersCount || 0}</div>
                <div className="text-xs text-slate-400">Orders</div>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-lg text-center">
                <CreditCard className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">₹{lead.totalSpent || 0}</div>
                <div className="text-xs text-slate-400">Total Spent</div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column: Activity Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-full">
            <h2 className="text-lg font-semibold text-white mb-6">Activity Timeline</h2>
            
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
              
              {/* Combine logs and orders into a unified timeline if possible, 
                  for now we rely on lead.activityLog which we added in backend */}
              
              {lead.activityLog && lead.activityLog.slice().reverse().map((log, index) => (
                <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  
                  {/* Icon */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-700 bg-slate-800 group-[.is-active]:bg-blue-500/20 group-[.is-active]:border-blue-500/50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 text-slate-400 group-[.is-active]:text-blue-400">
                    {log.action === 'order_placed' ? <Package className="w-5 h-5" /> :
                     log.action === 'add_to_cart' ? <ShoppingCart className="w-5 h-5" /> :
                     log.action === 'link_click' ? <MousePointer className="w-5 h-5" /> :
                     <Activity className="w-5 h-5" />}
                  </div>
                  
                  {/* Content */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 shadow-sm">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-slate-200 capitalize">
                        {log.action.replace(/_/g, ' ')}
                      </div>
                      <time className="font-caveat font-medium text-xs text-slate-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </time>
                    </div>
                    <div className="text-slate-400 text-sm">
                      {log.details}
                    </div>
                  </div>
                </div>
              ))}

              {(!lead.activityLog || lead.activityLog.length === 0) && (
                <div className="text-center text-slate-500 py-8">
                  No detailed activity recorded yet.
                </div>
              )}

            </div>
          </div>
        </div>

      </div>

      {/* Orders Table if any */}
      {orders && orders.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 overflow-hidden">
          <h2 className="text-lg font-semibold text-white mb-4">Order History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 text-sm">
                  <th className="p-3 font-medium">Order ID</th>
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Items</th>
                  <th className="p-3 font-medium">Amount</th>
                  <th className="p-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {orders.map(order => (
                  <tr key={order.orderId} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="p-3 text-white font-medium">{order.orderId}</td>
                    <td className="p-3 text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 text-slate-300">
                      {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    </td>
                    <td className="p-3 text-emerald-400 font-bold">₹{order.amount}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadDetails;
