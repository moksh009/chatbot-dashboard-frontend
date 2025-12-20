import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const Toggle = ({ checked, onChange, label, disabled = false }) => {
  return (
    <div className={clsx("flex items-center gap-3", disabled && "opacity-50 cursor-not-allowed")}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        className={clsx(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50",
          checked ? "bg-blue-600" : "bg-slate-700"
        )}
      >
        <span className="sr-only">Use setting</span>
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={clsx(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
      {label && <span className="text-sm text-slate-300">{label}</span>}
    </div>
  );
};

export default Toggle;
