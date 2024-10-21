import type { IActivityHandler } from "@vertigis/workflow";
import QuickbaseService from "../QuickbaseService";
import { get } from "../request";
interface GetTablesInputs {
  /**
   * @description The Quickbase API service.
   * @required
   */
  service: QuickbaseService;
  /**
   * @description The unique identifier of an app.
   * @required
   */
  appId: string;
}

interface GetTablesOutputs {
  result: {
    name: string;
    created: string;
    updated: string;
    alias: string;
    description: string;
    id: string;
    nextRecordId: number;
    nextFieldId: number;
    defaultSortFieldId: number;
    defaultSortOrder: string;
    keyFieldId: number;
    singleRecordName: string;
    pluralRecordName: string;
    sizeLimit: string;
    spaceUsed: string;
    spaceRemaining: string;
  }[];
}

/**
 * @category Quickbase
 * @description  Gets a list of all the tables that exist in a specific application. 
 * @helpUrl https://developer.quickbase.com/operation/getAppTables
 * @clientOnly
 * @supportedApps EXB, GWV
 */
export default class GetTables implements IActivityHandler {
  async execute(inputs: GetTablesInputs): Promise<GetTablesOutputs> {
    const { service, appId } = inputs;
    if (!service) {
      throw new Error("service is required");
    }
    if (!appId) {
      throw new Error("appId is required");
    }
    const query = {
      appId,
    };
    const path = `/tables`;
    const response = await get(service, appId, path, query)
    return {
      result: response,
    };
  }
}
