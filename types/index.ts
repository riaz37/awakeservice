export interface MonitorLog {
    id: string;
    monitorId: string;
    status: string;
    latency: number;
    createdAt: string;
}

export interface Monitor {
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
