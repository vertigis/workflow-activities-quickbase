/* eslint-disable @typescript-eslint/no-unsafe-argument */


export default class QuickbaseService {
  instanceUrl: string;
  hostName: string;
  private _tokens = new Map<string, QuickbaseToken>();

  constructor(url, hostname) {
    this.hostName = hostname;
    this.instanceUrl = url;

  }

  async getToken(id: string): Promise<string> {
    const qbToken = this._tokens.get(id);
    if (qbToken && qbToken.expiration < Date.now()) {
      return qbToken.token;
    } else {
      const message = await this.postMessageAwaitReply(id);
      if (message && message.error) {
        throw new Error(message.error)
      } else if (message.parameters && message.parameters.token) {
        this._tokens.set(id, message.parameters);
        return `QB-TEMP-TOKEN ${message.parameters.token}`;
      }
      throw new Error("The token request failed unexpectedly.")

    }

  }

  postMessageAwaitReply(id: string): Promise<MessageResponse> {
    const owner = window.parent === window ? window.opener : window.parent;
    if (!owner) {
      throw new Error(
        "Parent window or window opener not found."
      );
    }

    if (!this.hostName) {
      throw new Error(
        "hostname not found."
      );
    }

    return new Promise<MessageResponse>(resolve => {
      const channel = new MessageChannel();
      channel.port1.onmessage = ({ data }) => {
        channel.port1.close();
        resolve(data);
      };

      owner.postMessage({ action: "authenticate", parameters: { id } }, "https://" + this.hostName, [channel.port2]);
    });
  }

}

export interface QuickbaseToken {
  token: string;
  expiration: number;
}

export interface MessageResponse {
  parameters: QuickbaseToken;
  error?: string;
}

