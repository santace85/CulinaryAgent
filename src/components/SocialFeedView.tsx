import React from "react";

export const SocialFeedView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-300">
        <h2 className="text-xl font-semibold text-white">
          Social sharing is disabled
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          The community feed has been removed from this app.
        </p>
      </div>
    </div>
  );
};
