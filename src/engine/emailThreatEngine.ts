import { EmailAnalysisResult, DeliveryHop, ForensicIndicator, ThreatScoreExplanation } from '@/types';
import { getGeoIntelligenceForIp } from './geoIntelligence';

export class EmailThreatEngine {
  /**
   * Analyzes raw email text (headers + content) and generates a comprehensive forensic report.
   * This is a mock implementation for the SIH demo.
   */
  async analyzeEmail(rawEmail: string): Promise<EmailAnalysisResult> {
    const rawLower = rawEmail.toLowerCase();
    
    // 1. Basic parsing heuristics
    const isPhishing = rawLower.includes('urgent') || rawLower.includes('suspend') || rawLower.includes('verify your account') || rawLower.includes('login-sbi-secure');
    
    const senderClaimed = this.extractHeader(rawEmail, 'From') || 'unknown@example.com';
    const returnPath = this.extractHeader(rawEmail, 'Return-Path') || senderClaimed;
    
    // Simulate SPF/DKIM based on mismatch
    const hasMismatch = senderClaimed !== returnPath && returnPath !== 'unknown@example.com';
    const spfResult = hasMismatch ? 'fail' : 'pass';
    const dkimResult = hasMismatch ? 'fail' : 'pass';
    
    // Extract originating IP (mock extraction)
    const ipMatch = rawEmail.match(/\[(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\]/);
    const originatingIp = ipMatch ? ipMatch[1] : (isPhishing ? '185.199.108.153' : '142.250.192.46');
    
    // 2. Fetch GeoIntelligence
    const geoInfo = await getGeoIntelligenceForIp(originatingIp);
    
    // 3. Build Forensic Indicators
    const indicators: ForensicIndicator[] = [];
    let threatScore = 0;
    const explanations: ThreatScoreExplanation[] = [];
    
    if (isPhishing) {
      threatScore = 91;
      
      indicators.push({ type: 'sender', value: returnPath, description: 'Mismatch between From and Return-Path headers', severity: 'high' });
      explanations.push({ factor: 'Header anomalies', impact: 25, description: 'Return-Path does not match claimed sender' });
      
      indicators.push({ type: 'url', value: 'login-sbi-secure.xyz', description: 'Suspicious domain mimicking financial institution', severity: 'critical' });
      explanations.push({ factor: 'URL indicators', impact: 30, description: 'Links point to known phishing infrastructure' });
      
      if (geoInfo.reputation === 'Malicious' || geoInfo.reputation === 'Suspicious') {
        indicators.push({ type: 'ip', value: originatingIp, description: 'Originating IP has poor reputation', severity: 'high' });
        explanations.push({ factor: 'IP reputation', impact: 20, description: 'Originating IP is blacklisted' });
      }
      
      indicators.push({ type: 'content', value: 'Urgent action required', description: 'Sense of urgency typical in phishing', severity: 'medium' });
      explanations.push({ factor: 'Content analysis', impact: 16, description: 'High pressure urgency and threats of account suspension' });
      
    } else {
      threatScore = 12;
      indicators.push({ type: 'sender', value: senderClaimed, description: 'Sender domain has good reputation', severity: 'info' });
      explanations.push({ factor: 'Sender reputation', impact: 5, description: 'Domain is well established' });
      explanations.push({ factor: 'Authentication', impact: 7, description: 'SPF and DKIM passed' });
    }
    
    // 4. Mock Delivery Path
    const deliveryPath: DeliveryHop[] = [
      { hopNumber: 1, serverInfo: 'mail.origin.net', timestamp: new Date(Date.now() - 3600000).toISOString(), ip: originatingIp, delay: '0s' },
      { hopNumber: 2, serverInfo: 'mx.google.com', timestamp: new Date(Date.now() - 3590000).toISOString(), ip: '142.250.114.26', delay: '10s' },
      { hopNumber: 3, serverInfo: 'imap.local', timestamp: new Date(Date.now() - 3588000).toISOString(), ip: null, delay: '2s' },
    ];

    return {
      threatScore,
      threatLevel: threatScore > 80 ? 'CRITICAL' : (threatScore > 50 ? 'HIGH' : (threatScore > 20 ? 'MEDIUM' : 'SAFE')),
      classification: isPhishing ? 'PHISHING' : 'BENIGN',
      confidence: 94,
      sender: {
        claimed: senderClaimed,
        actual: returnPath,
        spf: spfResult,
        dkim: dkimResult,
        dmarc: 'none'
      },
      infrastructure: {
        originatingIp,
        geoInfo,
        claimedOrigin: rawLower.includes('bangalore') || rawLower.includes('india') ? 'India' : null
      },
      deliveryPath,
      indicators,
      scoreExplanation: explanations
    };
  }

  private extractHeader(raw: string, headerName: string): string | null {
    const regex = new RegExp(`^${headerName}:\\s*(.+)$`, 'im');
    const match = raw.match(regex);
    if (match && match[1]) {
      // clean up typical email formats like "Name <email@domain.com>"
      const emailMatch = match[1].match(/<([^>]+)>/);
      return emailMatch ? emailMatch[1] : match[1].trim();
    }
    return null;
  }
}
