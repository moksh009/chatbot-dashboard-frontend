import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useSocket } from '../context/SocketContext';
import { Calendar, Clock, User, Stethoscope, Trash2, Search, Filter, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';

import EmptyState from '../components/ui/EmptyState';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const socket = useSocket();

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = () => fetchAppointments();
    socket.on('appointments_update', handler);
    return () => {
      socket.off('appointments_update', handler);
    };
  }, [socket]);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id) => {
    setAppointmentToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleCancel = async () => {
    if (!appointmentToDelete) return;
    try {
      await api.delete(`/appointments/${appointmentToDelete}`);
      setAppointments(appointments.filter(app => app._id !== appointmentToDelete));
      setDeleteModalOpen(false);
      setAppointmentToDelete(null);
    } catch (err) {
      console.error('Error cancelling appointment:', err);
    }
  };

  const filteredAppointments = appointments.filter(app => 
    app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.phone?.includes(searchTerm) ||
    app.doctor?.toLowerCase().includes(searchTerm.toLowerCase())
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

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Appointments</h2>
          <p className="text-slate-400">Manage your scheduled appointments</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-full md:w-64">
            <Input
              icon={Search}
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900/50"
            />
          </div>
          <Button variant="outline" className="shrink-0">
            <Filter size={18} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-40 flex flex-col justify-between">
              <div className="flex items-start gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <Card className="hidden md:block overflow-hidden" noPadding>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/5">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Doctor</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence>
                    {filteredAppointments.map((appt) => (
                      <motion.tr 
                        key={appt._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-white/5 transition-colors group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center text-blue-400 mr-3 border border-blue-500/10">
                              <User size={16} />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">{appt.name}</div>
                              <div className="text-xs text-slate-500">{appt.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="info">
                            {appt.service}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col text-sm text-slate-400">
                            <span className="flex items-center gap-1.5 text-slate-300"><Calendar size={14} className="text-slate-500" /> {appt.date}</span>
                            <span className="flex items-center gap-1.5 text-slate-500"><Clock size={14} /> {appt.time}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-slate-400">
                            <Stethoscope size={16} className="mr-2 text-slate-600" />
                            {appt.doctor}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => confirmDelete(appt._id)}
                            className="text-slate-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Cancel Appointment"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            
            {filteredAppointments.length === 0 && (
              <EmptyState 
                icon={Calendar}
                title="No appointments found"
                description="Try adjusting your search or filter to find what you're looking for."
                className="py-12"
              />
            )}
          </Card>

          {/* Mobile Card View */}
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="md:hidden space-y-4"
          >
            {filteredAppointments.map((appt) => (
              <motion.div variants={item} key={appt._id}>
                <Card className="border border-white/5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center text-blue-400 border border-blue-500/10">
                        <User size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-200">{appt.name}</h3>
                        <p className="text-xs text-slate-500">{appt.phone}</p>
                      </div>
                    </div>
                    <Badge variant="info" className="text-[10px]">
                      {appt.service}
                    </Badge>
                  </div>

                  <div className="space-y-3 mb-4 bg-slate-950/30 p-3 rounded-xl border border-white/5">
                    <div className="flex items-center text-sm text-slate-400">
                      <Calendar size={14} className="mr-3 text-slate-600" />
                      {appt.date}
                    </div>
                    <div className="flex items-center text-sm text-slate-400">
                      <Clock size={14} className="mr-3 text-slate-600" />
                      {appt.time}
                    </div>
                    <div className="flex items-center text-sm text-slate-400">
                      <Stethoscope size={14} className="mr-3 text-slate-600" />
                      {appt.doctor}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      variant="ghost"
                      onClick={() => confirmDelete(appt._id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-9 text-xs"
                    >
                      <Trash2 size={14} className="mr-2" /> Cancel Appointment
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
            
            {filteredAppointments.length === 0 && (
              <EmptyState 
                icon={Calendar}
                title="No appointments found"
                description="Try adjusting your search."
                className="py-12"
              />
            )}
          </motion.div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Cancel Appointment"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>
              Keep Appointment
            </Button>
            <Button 
              className="bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-900/20 border-none" 
              onClick={handleCancel}
            >
              Yes, Cancel It
            </Button>
          </div>
        }
      >
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 text-red-500">
            <AlertCircle size={32} />
          </div>
          <h4 className="text-xl font-semibold text-white mb-2">Are you sure?</h4>
          <p className="text-slate-400">
            This action cannot be undone. The appointment will be permanently removed from the schedule.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default Appointments;
