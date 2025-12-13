import { MonitorLog } from '@/types';
import { Server } from 'lucide-react';

interface MonitorLogsProps {
    logs: MonitorLog[];
}

export default function MonitorLogs({ logs }: MonitorLogsProps) {
    return (
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
                            {logs.slice().reverse().map((log) => (
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
                    {logs.length === 0 && (
                        <div className="px-4 py-8 text-center text-gray-500">
                            No logs recorded yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
