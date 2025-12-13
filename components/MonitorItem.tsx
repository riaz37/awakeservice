'use client';

import { Monitor } from '@/types';
import { Trash2, CheckCircle2, XCircle, Clock, Activity, ArrowUpRight, AlertTriangle, Play, Pause, Server, RefreshCw } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import MonitorChart from './MonitorChart';
import MonitorLogs from './MonitorLogs';

interface MonitorItemProps {
    monitor: Monitor;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onDelete: (e: React.MouseEvent, id: string) => void;
    onToggleMaintenance: (id: string, currentStatus: boolean) => void;
    isMaintenanceLoading: boolean;
}

export default function MonitorItem({
    monitor,
    isExpanded,
    onToggleExpand,
    onDelete,
    onToggleMaintenance,
    isMaintenanceLoading
}: MonitorItemProps) {
    const isUp = monitor.status === 'success';
    const isMaintenance = monitor.maintenance;

    // Format data for chart
    const data = (monitor.logs || []).map(l => ({
        latency: l.latency,
        time: new Date(l.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: l.status,
        fullDate: new Date(l.createdAt).toLocaleString()
    }));

    // Sparkline data (just latency)
    const sparklineData = (monitor.logs || []).map(l => ({ latency: l.latency }));

    return (
        <div
            onClick={onToggleExpand}
            className={`group bg-[#0A0A0A] hover:bg-[#0F0F0F] border ${isExpanded ? 'border-blue-500/50 ring-1 ring-blue-500/20' : 'border-white/10 hover:border-white/20'} rounded-2xl transition-all duration-200 cursor-pointer overflow-hidden`}
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
                        <AreaChart data={sparklineData}>
                            <Area type="monotone" dataKey="latency" stroke={isUp ? "#10b981" : "#ef4444"} fill={isUp ? "#10b98120" : "#ef444420"} strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => onDelete(e, monitor.id)}
                        className="p-2 hover:bg-red-500/10 text-gray-500 hover:text-red-500 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
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
                                <MonitorChart data={data} />
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
                                            onToggleMaintenance(monitor.id, monitor.maintenance);
                                        }}
                                        disabled={isMaintenanceLoading}
                                        className={`flex-1 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 py-2 rounded-lg text-sm border border-yellow-500/20 transition-colors flex items-center justify-center gap-2 ${isMaintenanceLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                        {isMaintenanceLoading ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                        ) : monitor.maintenance ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                                        {monitor.maintenance ? 'Resume Monitoring' : 'Maintenance Mode'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <MonitorLogs logs={monitor.logs} />
                </div>
            )}
        </div>
    );
}
