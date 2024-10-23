import type { IActivityHandler } from "@vertigis/workflow";
import QuickbaseService from "../QuickbaseService";
import { get } from "../request";

interface GetTableInputs {
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
  /**
   * @description The Quickbase table Id.
   * @required
   */
  tableId: string;
}

interface GetTableOutputs {
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
  };
}

/**
 * @category Quickbase
 * @description  Gets the properties of an individual table that is part of an application.
 * @helpUrl https://developer.quickbase.com/operation/getTable
 * @clientOnly
 * @supportedApps EXB, GWV
 */
export default class GetTable implements IActivityHandler {
  async execute(inputs: GetTableInputs): Promise<GetTableOutputs> {
    const { service, tableId, appId } = inputs;
    if (!service) {
      throw new Error("service is required");
    }
    if (!tableId) {
      throw new Error("tableId is required");
    }
    if (!appId) {
      throw new Error("appId is required");
    }
    const query = {
      appId,
    };
    const path = `/${tableId}`;
    const response = await get(service, tableId, path, query)
    return {
      result: response,
    };
  }
}
