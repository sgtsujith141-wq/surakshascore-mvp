export interface GmailMessageInfo {
  id: string;
  threadId: string;
  snippet: string;
}

export interface GmailRawMessage {
  id: string;
  raw: string; // Base64url encoded raw string
}

export class GmailService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Fetch recent emails from the authenticated user's inbox.
   */
  async fetchRecentEmails(maxResults = 5): Promise<GmailMessageInfo[]> {
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=in:inbox`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch emails: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.messages) return [];

    // Fetch snippets for each message
    const messagesWithSnippets = await Promise.all(
      data.messages.map(async (msg: any) => {
        const detailRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata`,
          {
            headers: { Authorization: `Bearer ${this.accessToken}` },
          }
        );
        if (detailRes.ok) {
          const detailData = await detailRes.json();
          return {
            id: msg.id,
            threadId: msg.threadId,
            snippet: detailData.snippet,
          };
        }
        return msg;
      })
    );

    return messagesWithSnippets;
  }

  /**
   * Fetch the full raw contents of a specific email.
   * This raw string can be passed directly to the EmailThreatEngine.
   */
  async fetchEmailRaw(messageId: string): Promise<string> {
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=raw`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch raw email: ${response.statusText}`);
    }

    const data = await response.json();
    
    // The raw string is base64url encoded.
    // Replace - with + and _ with / for standard base64 decoding.
    const base64 = data.raw.replace(/-/g, '+').replace(/_/g, '/');
    
    // Decode base64 to text (handles unicode correctly in browser via TextDecoder or atob)
    try {
        const binString = atob(base64);
        const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0)!);
        return new TextDecoder().decode(bytes);
    } catch (e) {
        return atob(base64);
    }
  }
}
