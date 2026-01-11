import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Tooltip = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    top: { bottom: '100%', left: '50%', x: '-50%', mb: '8px' },
    bottom: { top: '100%', left: '50%', x: '-50%', mt: '8px' },
    left: { right: '100%', top: '50%', y: '-50%', mr: '8px' },
    right: { left: '100%', top: '50%', y: '-50%', ml: '8px' },
  };

  const currentPos = positions[position];

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 px-2 py-1 text-xs font-medium text-white bg-slate-800 rounded shadow-xl border border-white/10 whitespace-nowrap pointer-events-none"
            style={{
              ...currentPos,
              transform: `translate(${currentPos.x || 0}, ${currentPos.y || 0})`
            }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;
