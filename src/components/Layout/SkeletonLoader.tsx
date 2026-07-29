import React from 'react';

export const CardSkeleton = () => (
  <div className="glass-card p-6">
    <div className="skeleton h-6 w-32 mb-4 rounded"></div>
    <div className="skeleton h-24 w-full mb-3 rounded"></div>
    <div className="skeleton h-12 w-full rounded"></div>
  </div>
);

export const MapSkeleton = () => (
  <div className="glass-card p-4">
    <div className="skeleton h-8 w-48 mb-4 rounded"></div>
    <div className="skeleton h-[400px] w-full rounded"></div>
  </div>
);

export const ListSkeleton = ({ count = 3 }) => (
  <div className="space-y-3">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="skeleton h-16 w-full rounded"></div>
    ))}
  </div>
);