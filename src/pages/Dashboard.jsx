import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import DashboardHome from './DashboardHome';
import LiveChat from './LiveChat';
import Appointments from './Appointments';
import Analytics from './Analytics';
import CampaignManager from './CampaignManager';
import PageTransition from '../components/ui/PageTransition';
import { Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      <Sidebar />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-0">
        {/* Floating Top Bar */}
        <div className="px-4 py-3 md:px-8 md:py-4 z-20 shrink-0">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-3 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-4">
              <div className="font-bold text-lg bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                {user?.clientId || 'Client'}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area with Scroll */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-24 md:pb-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={
                <PageTransition>
                  <DashboardHome />
                </PageTransition>
              } />
              <Route path="/conversations" element={
                <PageTransition>
                  <LiveChat />
                </PageTransition>
              } />
              <Route path="/appointments" element={
                <PageTransition>
                  <Appointments />
                </PageTransition>
              } />
              <Route path="/campaigns" element={
                <PageTransition>
                  <CampaignManager />
                </PageTransition>
              } />
              <Route path="/analytics" element={
                <PageTransition>
                  <Analytics />
                </PageTransition>
              } />
            </Routes>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
