import React from 'react';
import clsx from 'clsx';

const Input = ({ icon: Icon, className, error, ...props }) => {
  return (
    <div className="w-full">
      <div className="relative group">
        {Icon && (
          <Icon 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors" 
            size={18} 
          />
        )}
        <input
          className={clsx(
            "w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-500",
            Icon ? "pl-10 pr-4 py-2.5" : "px-4 py-2.5",
            error && "border-red-500/50 focus:border-red-500 focus:ring-red-500/20",
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-400 ml-1">{error}</p>
      )}
    </div>
  );
};

export default Input;
