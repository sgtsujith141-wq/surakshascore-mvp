import { GeoIntelligenceData } from '@/types';
import { Card } from '@/components/ui/Card';
import { Globe, Server, MapPin, ShieldAlert, Activity } from 'lucide-react';

interface GeoIntelCardProps {
  data: GeoIntelligenceData;
  claimedOrigin: string | null;
}

export function GeoIntelCard({ data, claimedOrigin }: GeoIntelCardProps) {
  const isMismatch = claimedOrigin && data.country.toLowerCase() !== claimedOrigin.toLowerCase();

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-cyber-neon/10 text-cyber-neon rounded-lg">
          <Globe size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Infrastructure Intelligence</h3>
          <p className="text-sm text-cyber-textMuted">Geographical and network mapping</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {claimedOrigin && (
          <div className="p-4 bg-cyber-bg/50 rounded-xl border border-cyber-neon/20">
            <div className="flex items-center gap-2 mb-2 text-cyber-textMuted">
              <MapPin size={16} />
              <span className="text-sm font-semibold">Claimed Origin</span>
            </div>
            <p className="text-white font-medium">{claimedOrigin}</p>
          </div>
        )}

        <div className={`p-4 rounded-xl border ${isMismatch ? 'bg-red-500/10 border-red-500/30' : 'bg-cyber-bg/50 border-cyber-neon/20'}`}>
          <div className="flex items-center gap-2 mb-2 text-cyber-textMuted">
            <Server size={16} />
            <span className="text-sm font-semibold">Observed Infrastructure</span>
          </div>
          <p className="text-white font-medium">{data.country}</p>
          {isMismatch && (
            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
              <ShieldAlert size={12} />
              Origin mismatch detected
            </p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 bg-cyber-surface rounded-lg">
          <span className="text-cyber-textMuted text-sm">IP Address</span>
          <span className="text-white font-mono text-sm">{data.ip}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-cyber-surface rounded-lg">
          <span className="text-cyber-textMuted text-sm">Network Provider (ISP)</span>
          <span className="text-white text-sm">{data.isp}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-cyber-surface rounded-lg">
          <span className="text-cyber-textMuted text-sm">Network Type</span>
          <span className="text-white text-sm">{data.hostingType}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-cyber-surface rounded-lg border border-transparent">
          <span className="text-cyber-textMuted text-sm flex items-center gap-2">
            <Activity size={16} /> Threat Reputation
          </span>
          <span className={`text-sm font-bold ${
            data.reputation === 'Malicious' ? 'text-red-500' :
            data.reputation === 'Suspicious' ? 'text-yellow-500' :
            'text-green-500'
          }`}>{data.reputation}</span>
        </div>
      </div>
    </Card>
  );
}
