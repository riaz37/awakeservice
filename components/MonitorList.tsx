'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Activity } from 'lucide-react';
import MonitorItem from './MonitorItem';
import { Monitor } from '@/types';

export default function MonitorList({ refreshTrigger }: { refreshTrigger: number }) {
    const [monitors, setMonitors] = useState<Monitor[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const fetchMonitors = async () => {
        try {
            const res = await fetch('/api/monitors');
            const data = await res.json();
            setMonitors(data);
        } catch (error) {
            console.error('Failed to fetch monitors', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteMonitor = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this monitor?')) return;
        try {
            await fetch(`/api/monitors/${id}`, { method: 'DELETE' });
            fetchMonitors();
        } catch (err) { console.error(err) }
    };

    const toggleMaintenance = async (id: string, currentStatus: boolean) => {
        setTogglingId(id);
        try {
            await fetch(`/api/monitors/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ maintenance: !currentStatus }),
            });
            await fetchMonitors();
        } catch (err) { console.error(err) }
        setTogglingId(null);
    };

    const triggerPing = async () => {
        setLoading(true);
        try {
            await fetch('/api/cron');
            await fetchMonitors();
        } catch (err) { console.error(err) }
        setLoading(false);
    };

    useEffect(() => {
        fetchMonitors();
    }, [refreshTrigger]);

    if (loading && monitors.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <RefreshCw className="w-10 h-10 animate-spin text-blue-500" />
                <p className="text-gray-500 animate-pulse">Loading status...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-white">Monitors</h2>
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs text-gray-400">{monitors.length} Active</span>
                </div>
                <button
                    onClick={triggerPing}
                    disabled={loading}
                    className="group bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm transition-all border border-white/10 hover:border-white/20"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                    Run Check Now
                </button>
            </div>

            {monitors.length === 0 ? (
                <div className="text-center py-20 bg-gradient-to-b from-white/5 to-transparent rounded-2xl border border-dashed border-white/10">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Activity className="w-8 h-8 text-white/20" />
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2">No monitors yet</h3>
                    <p className="text-white/40 max-w-sm mx-auto">Add your first endpoint above to start tracking uptime and performance history.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {monitors.map((monitor) => (
                        <MonitorItem
                            key={monitor.id}
                            monitor={monitor}
                            isExpanded={expandedId === monitor.id}
                            onToggleExpand={() => setExpandedId(expandedId === monitor.id ? null : monitor.id)}
                            onDelete={deleteMonitor}
                            onToggleMaintenance={toggleMaintenance}
                            isMaintenanceLoading={togglingId === monitor.id}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

