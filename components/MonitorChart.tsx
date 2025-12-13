'use client';

import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface MonitorChartProps {
    data: {
        latency: number;
        time: string;
        status: string;
        fullDate: string;
    }[];
}

export default function MonitorChart({ data }: MonitorChartProps) {
    return (
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
    );
}
