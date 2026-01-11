import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Calendar, 
  Settings, 
  LogOut, 
  ShoppingBag, 
  BarChart2, 
  Megaphone,
  Package
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isEcommerce = user?.business_type === 'ecommerce';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: MessageSquare, label: 'Live Chat', path: '/conversations' },
    !isEcommerce && { icon: Calendar, label: 'Appointments', path: '/appointments' },
    isEcommerce && { icon: Package, label: 'Orders', path: '/orders' },
    { icon: Megaphone, label: 'Campaigns', path: '/campaigns' },
    { icon: BarChart2, label: 'Analytics', path: '/analytics' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ].filter(Boolean);

  return (
    <div className="fixed md:static bottom-0 w-full md:w-64 bg-slate-900 border-t md:border-r border-white/5 flex flex-row md:flex-col justify-between h-16 md:h-screen z-50 transition-all duration-300">
      
      {/* Desktop Logo Area */}
      <div className="hidden md:flex p-6 items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
          <ShoppingBag className="text-white w-6 h-6" />
        </div>
        <span className="font-bold text-xl tracking-tight text-white">Delitech</span>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 flex md:flex-col justify-around md:justify-start px-2 md:px-4 md:py-6 overflow-x-auto md:overflow-y-auto md:space-y-2 no-scrollbar">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex flex-col md:flex-row items-center gap-1 md:gap-3 px-3 py-2 md:py-3 rounded-xl transition-all duration-200 group
              ${isActive 
                ? 'text-blue-400 md:bg-blue-600 md:text-white md:shadow-md' 
                : 'text-slate-400 hover:text-slate-100 md:hover:bg-white/5'
              }
            `}
          >
            <item.icon size={20} className="md:w-5 md:h-5 w-6 h-6" />
            <span className="text-[10px] md:text-base font-medium">{item.label}</span>
          </NavLink>
        ))}
        
        {/* Mobile Logout (Icon Only) */}
        <button 
          onClick={handleLogout}
          className="md:hidden flex flex-col items-center gap-1 px-3 py-2 text-slate-400 hover:text-red-400"
        >
          <LogOut size={20} className="w-6 h-6" />
          <span className="text-[10px] font-medium">Logout</span>
        </button>
      </nav>

      {/* Desktop User & Logout */}
      <div className="hidden md:block p-4 border-t border-white/5">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold border border-white/10">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate capitalize">{user?.business_type}</p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;