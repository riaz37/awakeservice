'use client';

import { useEffect, useState } from 'react';
import { Trash2, CheckCircle2, XCircle, RefreshCw, Globe, Clock, Activity, ArrowUpRight, AlertTriangle, Play, Pause, Server, BarChart2 } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface MonitorLog {
    id: string;
    monitorId: string;
    status: string;
    latency: number;
    createdAt: string;
}

interface Monitor {
    id: string;
    url: string;
    isActive: boolean;
    status: string | null;
    lastPing: string | null;
    interval: number;
    maintenance: boolean;
    method: string;
    logs: MonitorLog[];
}

export default function MonitorList({ refreshTrigger }: { refreshTrigger: number }) {
    const [monitors, setMonitors] = useState<Monitor[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

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

    const [togglingId, setTogglingId] = useState<string | null>(null);

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
                    {monitors.map((monitor) => {
                        const isUp = monitor.status === 'success';
                        const isMaintenance = monitor.maintenance;
                        // Format data for chart
                        const data = (monitor.logs || []).map(l => ({
                            latency: l.latency,
                            time: new Date(l.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            status: l.status,
                            fullDate: new Date(l.createdAt).toLocaleString()
                        }));

                        return (
                            <div
                                key={monitor.id}
                                onClick={() => setExpandedId(expandedId === monitor.id ? null : monitor.id)}
                                className={`group bg-[#0A0A0A] hover:bg-[#0F0F0F] border ${expandedId === monitor.id ? 'border-blue-500/50 ring-1 ring-blue-500/20' : 'border-white/10 hover:border-white/20'} rounded-2xl transition-all duration-200 cursor-pointer overflow-hidden`}
                            >
                                <div className="p-5 flex flex-col md:flex-row items-center gap-6">
                                    {/* Status Icon */}
                                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${isMaintenance ? 'bg-yellow-500/10 text-yellow-500' :
                                        isUp ? 'bg-emerald-500/10 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]' :
                                            'bg-red-500/10 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                                        }`}>
                                        {isMaintenance ? <AlertTriangle className="w-6 h-6" /> :
                                            isUp ? <CheckCircle2 className="w-6 h-6" /> :
                                                <XCircle className="w-6 h-6" />}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0 grid gap-1 w-full text-center md:text-left">
                                        <div className="flex items-center gap-2 justify-center md:justify-start">
                                            <h3 className="font-semibold text-lg text-white truncate">{monitor.url}</h3>
                                            <a href={monitor.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-white/20 hover:text-white transition-colors">
                                                <ArrowUpRight className="w-4 h-4" />
                                            </a>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-500 justify-center md:justify-start">
                                            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                                                <Clock className="w-3.5 h-3.5" /> {monitor.interval}m
                                            </span>
                                            <span className="bg-white/5 px-2 py-0.5 rounded-full text-xs font-mono">{monitor.method || 'GET'}</span>
                                            {monitor.lastPing && (
                                                <span className="hidden md:inline-block text-gray-600">
                                                    Last check: {new Date(monitor.lastPing).toLocaleTimeString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Mini Graph (Sparkline) */}
                                    <div className="h-12 w-32 hidden md:block opacity-50 group-hover:opacity-100 transition-opacity">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={data}>
                                                <Area type="monotone" dataKey="latency" stroke={isUp ? "#10b981" : "#ef4444"} fill={isUp ? "#10b98120" : "#ef444420"} strokeWidth={2} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => deleteMonitor(e, monitor.id)}
                                            className="p-2 hover:bg-red-500/10 text-gray-500 hover:text-red-500 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {expandedId === monitor.id && (
                                    <div className="border-t border-white/5 bg-black/20 p-6 animate-in slide-in-from-top-2 duration-200 cursor-default" onClick={e => e.stopPropagation()}>
                                        <div className="grid md:grid-cols-2 gap-8">
                                            {/* Left: Stats & Config */}
                                            <div className="space-y-6">
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                                                        <Server className="w-4 h-4" /> Configuration
                                                    </h4>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="bg-white/5 p-3 rounded-lg">
                                                            <div className="text-xs text-gray-500 mb-1">Method</div>
                                                            <div className="font-mono text-sm">{monitor.method || "GET"}</div>
                                                        </div>
                                                        <div className="bg-white/5 p-3 rounded-lg">
                                                            <div className="text-xs text-gray-500 mb-1">Interval</div>
                                                            <div className="text-sm">{monitor.interval} minutes</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                                                        <Activity className="w-4 h-4" /> Response Time History (Last 50 Pings)
                                                    </h4>
                                                    <div className="h-64 w-full bg-[#080808] rounded-xl p-4 border border-white/5 relative overflow-hidden">
                                                        <div className="absolute inset-0 bg-blue-500/5 pointer-events-none" />
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <AreaChart data={data}>
                                                                <defs>
                                                                    <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                                    </linearGradient>
                                                                </defs>
                                                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                                                <XAxis
                                                                    dataKey="time"
                                                                    stroke="#666"
                                                                    fontSize={10}
                                                                    tickLine={false}
                                                                    axisLine={false}
                                                                    minTickGap={20}
                                                                />
                                                                <YAxis
                                                                    stroke="#666"
                                                                    fontSize={10}
                                                                    tickLine={false}
                                                                    axisLine={false}
                                                                    width={30}
                                                                    tickFormatter={(value) => `${value}ms`}
                                                                />
                                                                <Tooltip
                                                                    content={({ active, payload, label }) => {
                                                                        if (active && payload && payload.length) {
                                                                            const p = payload[0].payload;
                                                                            return (
                                                                                <div className="bg-black/80 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-xl text-xs">
                                                                                    <div className="text-gray-400 mb-1">{p.fullDate}</div>
                                                                                    <div className="flex items-center gap-2">
                                                                                        <div className={`w-2 h-2 rounded-full ${p.status === 'UP' ? 'bg-green-500' : 'bg-red-500'}`} />
                                                                                        <span className="font-bold text-white text-sm">{p.latency} ms</span>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        }
                                                                        return null;
                                                                    }}
                                                                />
                                                                <Area
                                                                    type="monotone"
                                                                    dataKey="latency"
                                                                    stroke="#3b82f6"
                                                                    strokeWidth={3}
                                                                    fillOpacity={1}
                                                                    fill="url(#colorLatency)"
                                                                    animationDuration={1500}
                                                                />
                                                            </AreaChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right: Badge & Maintenance */}
                                            <div className="space-y-6">
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-400 mb-3">Health Status Badge</h4>
                                                    <div className="bg-[#111] p-4 rounded-lg border border-white/10 flex items-center justify-between gap-4">
                                                        <img
                                                            src={`https://img.shields.io/badge/uptime-99.9%25-success?style=for-the-badge&logo=activity`}
                                                            alt="Status Badge"
                                                            className="h-8"
                                                        />
                                                        <button
                                                            className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded transition-colors"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigator.clipboard.writeText(`![Status](${window.location.origin}/api/badge/${monitor.id})`);
                                                            }}
                                                        >
                                                            Copy Markdown
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-white/5">
                                                    <h4 className="text-sm font-medium text-gray-400 mb-3">Danger Zone</h4>
                                                    <div className="flex gap-4">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleMaintenance(monitor.id, monitor.maintenance);
                                                            }}
                                                            disabled={togglingId === monitor.id}
                                                            className={`flex-1 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 py-2 rounded-lg text-sm border border-yellow-500/20 transition-colors flex items-center justify-center gap-2 ${togglingId === monitor.id ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                            {togglingId === monitor.id ? (
                                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                            ) : monitor.maintenance ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                                                            {monitor.maintenance ? 'Resume Monitoring' : 'Maintenance Mode'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Log History Below Grid */}
                                        <div className="border-t border-white/5 pt-6 mt-6">
                                            <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                                                <Server className="w-4 h-4" /> Log History
                                            </h4>
                                            <div className="bg-[#111] rounded-xl border border-white/5 overflow-hidden">
                                                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                                    <table className="w-full text-left text-sm">
                                                        <thead className="bg-white/5 text-gray-400 font-medium sticky top-0 backdrop-blur-md">
                                                            <tr>
                                                                <th className="px-4 py-3">Time</th>
                                                                <th className="px-4 py-3">Status</th>
                                                                <th className="px-4 py-3 text-right">Latency</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-white/5">
                                                            {(monitor.logs || []).slice().reverse().map((log) => (
                                                                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                                                    <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                                                                        {new Date(log.createdAt).toLocaleString()}
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${log.status === 'UP' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                                                            }`}>
                                                                            <div className={`w-1.5 h-1.5 rounded-full ${log.status === 'UP' ? 'bg-green-400' : 'bg-red-400'}`} />
                                                                            {log.status}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-right font-mono text-gray-400">
                                                                        {log.latency}ms
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                    {(monitor.logs || []).length === 0 && (
                                                        <div className="px-4 py-8 text-center text-gray-500">
                                                            No logs recorded yet.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
