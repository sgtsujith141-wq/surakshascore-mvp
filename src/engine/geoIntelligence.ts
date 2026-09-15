import { GeoIntelligenceData } from '@/types';

/**
 * Mocks a GeoIntelligence service for the SIH demo.
 */
export async function getGeoIntelligenceForIp(ip: string): Promise<GeoIntelligenceData> {
  // Mocking delay to simulate API call
  await new Promise(resolve => setTimeout(resolve, 800));

  if (ip === '185.199.108.153') {
    return {
      ip,
      country: 'Netherlands',
      isp: 'XYZ Hosting Services',
      asn: 'AS59092',
      hostingType: 'Datacenter',
      reputation: 'Malicious'
    };
  }
  
  if (ip === '142.250.192.46') {
    return {
      ip,
      country: 'United States',
      isp: 'Google LLC',
      asn: 'AS15169',
      hostingType: 'Corporate',
      reputation: 'Clean'
    };
  }

  // Default fallback
  return {
    ip,
    country: 'Unknown',
    isp: 'Unknown ISP',
    asn: 'AS0000',
    hostingType: 'Residential',
    reputation: 'Unknown'
  };
}
