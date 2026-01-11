import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Calendar, 
  BarChart3, 
  Users, 
  LogOut, 
  Menu,
  Send
} from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const Sidebar = () => {
  const { logout, user } = useAuth();

  const allNavItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/conversations', label: 'Live Chat', icon: MessageSquare },
    { path: '/appointments', label: 'Appointments', icon: Calendar },
    { path: '/campaigns', label: 'Campaigns', icon: Send },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const navItems = allNavItems.filter(item => {
    // Hide Appointments for Ecommerce
    if (user?.business_type === 'ecommerce' && item.path === '/appointments') {
      return false;
    }
    return true;
  });

  // Clients page removed

  const DesktopSidebar = () => (
    <div className="hidden md:flex w-72 h-screen sticky top-0 flex-col bg-slate-950/95 backdrop-blur-xl text-white shadow-2xl border-r border-white/5 z-50">
      <div className="p-6">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent tracking-tight">
          TopEdge AI
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">{user?.email}</p>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                isActive 
                  ? "text-white shadow-lg shadow-blue-900/20" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="activeNavDesktop"
                    className="absolute inset-0 bg-blue-600 -z-10"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon size={20} className={clsx("transition-transform duration-200", isActive ? "scale-110" : "group-hover:scale-110")} />
                <span className="font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all duration-200 group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );

  const MobileBottomNav = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-t border-white/5 pb-safe">
      <nav className="flex justify-around items-center p-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 relative min-w-[64px]",
                isActive ? "text-blue-400" : "text-slate-500 hover:text-slate-300"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="activeNavMobile"
                    className="absolute inset-0 bg-blue-500/10 rounded-xl -z-10"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium mt-1">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
        {/* Mobile Logout - Optional: Could be in a 'More' menu, but for now added as small icon or separate logic. 
            Given space constraints, let's keep it simple. Users can logout from profile in top bar if needed.
        */}
      </nav>
    </div>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileBottomNav />
    </>
  );
};

export default Sidebar;
