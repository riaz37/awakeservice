'use client';

import { useState } from 'react';
import { Plus, Loader2, ArrowRight } from 'lucide-react';

export default function AddMonitorForm({ onAdd }: { onAdd: () => void }) {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/monitors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }), // keeping simple for MVP (GET, 5m), detailed config to come later
            });

            if (!res.ok) throw new Error('Failed to add monitor');

            setUrl('');
            onAdd();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative group z-20">
            <div className={`absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-violet-500 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 ${loading ? 'opacity-75 animate-pulse' : ''}`}></div>
            <div className="relative bg-[#0A0A0A] rounded-xl p-4 md:p-6 border border-white/10 shadow-2xl">
                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full">
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Enter website URL to monitor (e.g. https://api.myservice.com)"
                            required
                            className="w-full bg-transparent border-none text-xl md:text-2xl text-white placeholder-gray-600 focus:ring-0 focus:outline-none font-medium text-center md:text-left h-12"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full md:w-auto bg-white text-black hover:bg-gray-200 font-semibold px-8 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> :
                            <>
                                Start Monitoring <ArrowRight className="w-5 h-5" />
                            </>}
                    </button>
                </form>
                {error && <p className="text-red-400 text-sm mt-3 text-center md:text-left animate-in slide-in-from-top-1">{error}</p>}

                <div className="mt-4 flex gap-4 text-xs text-gray-600 justify-center md:justify-start">
                    <span>⚡ Checks every 5 min</span>
                    <span>🔒 SSL Verification</span>
                    <span>📈 Uptime History</span>
                </div>
            </div>
        </div>
    );
}
