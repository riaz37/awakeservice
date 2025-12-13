'use client';

import { useState } from 'react';
import AddMonitorForm from '@/components/AddMonitorForm';
import MonitorList from '@/components/MonitorList';
import { Zap } from 'lucide-react';

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshMonitors = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans selection:bg-blue-500/30">
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="relative max-w-6xl mx-auto z-10">
        <header className="mb-16 flex flex-col items-center justify-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 rounded-full" />
            <div className="relative inline-flex items-center justify-center p-4 bg-white/5 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-sm">
              <Zap className="w-8 h-8 text-blue-400" fill="currentColor" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-gray-500 mb-4 tracking-tight">
            AwakeService
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl text-center leading-relaxed">
            Premium uptime monitoring with real-time analytics and detailed logging.
            <br className="hidden md:block" />
            Keep your services alive and your users happy.
          </p>
        </header>

        <div className="grid gap-8">
          <AddMonitorForm onAdd={refreshMonitors} />
          <MonitorList refreshTrigger={refreshTrigger} />
        </div>

        <footer className="mt-20 pt-8 border-t border-white/5 text-center text-gray-500 text-sm">
          AwakeService &copy; {new Date().getFullYear()} &middot; Status Page &middot; API Types
        </footer>
      </div>
    </main>
  );
}
