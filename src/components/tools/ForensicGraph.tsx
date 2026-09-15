import { ForensicIndicator } from '@/types';
import { Card } from '@/components/ui/Card';
import { Network, AlertCircle, MapPin, Link, Mail, Server } from 'lucide-react';

interface ForensicGraphProps {
  indicators: ForensicIndicator[];
}

export function ForensicGraph({ indicators }: ForensicGraphProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'sender': return <Mail size={18} />;
      case 'url': return <Link size={18} />;
      case 'ip': return <Server size={18} />;
      case 'location': return <MapPin size={18} />;
      default: return <AlertCircle size={18} />;
    }
  };

  const getColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
      case 'low': return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
      default: return 'text-cyber-neon bg-cyber-neon/10 border-cyber-neon/30';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-cyber-neon/10 text-cyber-neon rounded-lg">
          <Network size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Forensic Attack Graph</h3>
          <p className="text-sm text-cyber-textMuted">How did we reach this conclusion?</p>
        </div>
      </div>

      <div className="relative pl-6 border-l-2 border-cyber-neon/30 ml-4 space-y-6">
        <div className="absolute -left-[11px] top-0 bottom-0 w-5 bg-gradient-to-b from-transparent via-cyber-bg to-transparent opacity-50 pointer-events-none" />
        
        {indicators.map((indicator, index) => (
          <div key={index} className="relative">
            <div className={`absolute -left-[35px] top-1 p-1 rounded-full border bg-cyber-bg ${getColor(indicator.severity).split(' ')[0]} ${getColor(indicator.severity).split(' ')[2]}`}>
              {getIcon(indicator.type)}
            </div>
            <div className={`p-4 rounded-xl border ${getColor(indicator.severity)}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold uppercase tracking-wider opacity-80">{indicator.type}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-black/20">
                  {indicator.severity}
                </span>
              </div>
              <p className="text-white font-mono text-sm mb-1 break-all">{indicator.value}</p>
              <p className="text-sm opacity-90">{indicator.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
