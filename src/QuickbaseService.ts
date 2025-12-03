/* eslint-disable @typescript-eslint/no-unsafe-argument */
export default class QuickbaseService {
  readonly instanceUrl: string;
  readonly hostName: string;
  private _origin: string;
  private _tokens = new Map<string, QuickbaseToken>();
  private _owner: Window;

  constructor(url: string, hostname: string, origin: string) {
    this._owner = window.parent === window ? window.opener : window.parent;

    if (!this._owner) {
      throw new Error(
        "Parent window or window opener not found. Please ensure you are instantiating the service from a VertiGIS Studio app hosted in Quickbase."
      );
    }
    if(!url) {
      throw new Error(
        "Quickbase REST API URL is required."
      )
    }

    if(!hostname) {
      throw new Error(
        "Quickbase Hostname is required."
      )
    }
    this.instanceUrl = url.replace(/\/+$/, "");
    this.hostName = hostname;
    this._origin = origin;
  }

  async getToken(id: string): Promise<string> {
    const qbToken = this._tokens.get(id);
    if (qbToken && qbToken.expiration < Date.now()) {
      return `QB-TEMP-TOKEN ${qbToken.token}`;
    } else {
      const message = await this.postMessageAwaitReply(id);
      if (message?.error) {
        throw new Error(message.error)
      } else if (message?.parameters && message.parameters.token) {
        this._tokens.set(id, message.parameters);
        return `QB-TEMP-TOKEN ${message.parameters.token}`;
      }
      throw new Error("The token request failed unexpectedly.")
    }
  }

  postMessageAwaitReply(id: string): Promise<MessageResponse> {

    return new Promise<MessageResponse>(resolve => {
      const channel = new MessageChannel();
      channel.port1.onmessage = ({ data }) => {
        channel.port1.close();
        resolve(data);
      };
      this._owner.postMessage({ action: "authenticate", parameters: { id } }, this._origin, [channel.port2]);
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

