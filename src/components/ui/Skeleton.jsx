import React from 'react';
import clsx from 'clsx';

const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={clsx("animate-pulse rounded-md bg-slate-800/50", className)}
      {...props}
    />
  );
};

export default Skeleton;
