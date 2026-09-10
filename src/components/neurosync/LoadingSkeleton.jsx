import React from 'react';

function SkeletonBlock({ className }) {
  return <div className={`bg-secondary/60 rounded-2xl animate-pulse ${className}`} />;
}

export default function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground cyber-grid pb-24">
      {/* Navbar */}
      <div className="sticky top-0 z-40 bg-background/90 border-b border-white/5 px-4 md:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <SkeletonBlock className="w-44 h-10" />
          <SkeletonBlock className="w-28 h-10" />
        </div>
      </div>
      <main className="max-w-6xl mx-auto px-4 md:px-6 mt-6">
        {/* TabBar */}
        <div className="flex gap-2 mb-8">
          {[...Array(5)].map((_, i) => <SkeletonBlock key={i} className="w-24 h-12" />)}
        </div>
        {/* Cards */}
        <div className="space-y-3 max-w-3xl mx-auto">
          {[...Array(4)].map((_, i) => <SkeletonBlock key={i} className="h-20 w-full rounded-[2rem]" />)}
        </div>
      </main>
    </div>
  );
}