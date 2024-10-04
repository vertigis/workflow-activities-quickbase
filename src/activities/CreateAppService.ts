import type { IActivityHandler } from "@vertigis/workflow";

interface CreateAppServiceInputs {
  /**
   * @description The URL to the Quickbase API.
   * @required
   */
  url: string;
  /**
   * @description Your Quickbase domain, for example demo.quickbase.com.
   * @required
   */
  hostName: string;
  /**
   * @description Your Quickbase app token.
   * @required
   */
  accessToken: string;
  /**
   * @description Your Quickbase token type.
   * @required
   */
  tokenType: "QB-USER-TOKEN" | "QB-TEMP-TOKEN";
}

interface CreateAppServiceOutputs {
  /**
   * @description The result of the activity.
   */
  result: {
    url: string;
    hostName: string;
    access_token: string;
  };
}

/**
 * @category Quickbase
 * @description Creates a Quickbase App Service.
 * @clientOnly
 * @helpUrl https://developer.quickbase.com/auth
 * @supportedApps EXB, GWV
 */
export default class CreateAppService implements IActivityHandler {
  execute(inputs: CreateAppServiceInputs): CreateAppServiceOutputs {
    const { url, hostName, accessToken, tokenType } = inputs;
    if (!url) {
      throw new Error("url is required");
    }
    if (!hostName) {
      throw new Error("hostName is required");
    }
    if (!accessToken) {
      throw new Error("accessToken is required");
    }
    if (!tokenType) {
      throw new Error("tokenType is required");
    }
    const access_token = `${tokenType} ${accessToken}`;
    return {
      result: { url, hostName, access_token },
    };
  }
}
