import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';

// Floating Label Input Component
const FloatingInput = ({ id, type, label, value, onChange, icon: Icon }) => (
  <div className="relative group">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors z-10">
      <Icon size={20} />
    </div>
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      className="peer w-full pl-10 pr-4 pt-6 pb-2 bg-slate-900/50 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 text-white placeholder-transparent transition-all"
      placeholder={label}
      required
    />
    <label 
      htmlFor={id}
      className="absolute left-10 top-2 text-[10px] text-slate-500 font-medium transition-all 
                 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500 peer-placeholder-shown:top-4 
                 peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-blue-400"
    >
      {label}
    </label>
  </div>
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Subtle Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[20%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-md w-full glass-card rounded-2xl p-8 z-10 mx-4 relative"
      >
        {/* Glow Effect behind form */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-2xl pointer-events-none" />

        <div className="text-center mb-10 relative">
          <motion.div 
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
            className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/20 ring-1 ring-white/10"
          >
            <ShieldCheck className="text-white w-10 h-10" strokeWidth={1.5} />
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-white mb-2 tracking-tight"
          >
            Welcome Back
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-slate-400 text-sm"
          >
            Sign in to access your admin dashboard
          </motion.p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }}
            exit={{ opacity: 0, scale: 0.9 }}
            key={error}
            className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-4 rounded-xl mb-8 text-sm flex items-center gap-3 shadow-sm"
          >
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
               <div className="w-2 h-2 rounded-full bg-red-400" />
            </div>
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <FloatingInput 
              id="email"
              type="email"
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <FloatingInput 
              id="password"
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={Lock}
            />
          </motion.div>

          <motion.div 
            className="pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-900/20 border-0"
            >
              {!isLoading && <span className="flex items-center gap-2">Sign In <ArrowRight size={18} /></span>}
              {isLoading && "Verifying Credentials..."}
            </Button>
          </motion.div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 text-xs">
            Protected by Secure Admin System
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;