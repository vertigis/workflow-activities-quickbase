import type { IActivityHandler } from "@vertigis/workflow";
import QuickbaseService from "../QuickbaseService";


interface CreateQuickbaseServiceInputs {
  /**
   * @displayName Quickbase URL
   * @description The URL to the Quickbase API.
   * @required
   */
  quickbaseUrl: string;
  /**
   * @description Your Quickbase domain, for example demo.quickbase.com.
   * @required
   */
  hostName: string;
  /**
   * @description The origin of the hosting Quickbase window.
   * @required
   */
  targetOrigin: string;
}

interface CreateQuickbaseServiceOutputs {
  result: QuickbaseService;
}

/**
 * @category Quickbase
 * @description Creates an authenticated connection to Quickbase.  
 * @clientOnly
 * @helpUrl https://developer.quickbase.com/auth
 * @supportedApps EXB, GWV
 */
export default class CreateQuickbaseService implements IActivityHandler {
  execute(inputs: CreateQuickbaseServiceInputs): CreateQuickbaseServiceOutputs {
    const { quickbaseUrl, hostName, targetOrigin } = inputs;
    if (!quickbaseUrl) {
      throw new Error("quickbaseUrl is required");
    }
    if (!targetOrigin) {
      throw new Error("targetOrigin is required");
    }
    if (!hostName) {
      throw new Error("hostName is required");
    }
    const quickbaseUri = quickbaseUrl.replace(/\/*$/, "");

    return {
      result: new QuickbaseService(quickbaseUri, hostName, targetOrigin),
    }
  }
}
