import React from 'react';
import { motion } from 'framer-motion';
import { PackageOpen } from 'lucide-react';
import clsx from 'clsx';

const EmptyState = ({ 
  icon: Icon = PackageOpen, 
  title = "No data available", 
  description = "There is nothing to show here yet.",
  action,
  className 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx("flex flex-col items-center justify-center py-12 px-4 text-center", className)}
    >
      <div className="w-20 h-20 bg-slate-900/50 rounded-full flex items-center justify-center mb-6 border border-white/5 shadow-inner">
        <Icon size={40} className="text-slate-600 opacity-80" />
      </div>
      
      <h3 className="text-lg font-bold text-slate-200 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6 leading-relaxed">
        {description}
      </p>
      
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </motion.div>
  );
};

export default EmptyState;
