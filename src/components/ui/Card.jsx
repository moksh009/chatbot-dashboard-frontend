import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const Card = ({ children, className, noPadding = false, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={clsx(
        "bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl shadow-xl overflow-hidden",
        !noPadding && "p-6",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
