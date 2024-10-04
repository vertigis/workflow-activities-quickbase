import type { IActivityHandler } from "@vertigis/workflow";
import { ApiService } from "../ApiService";
import esriRequest from "@arcgis/core/request";

interface GetRelationshipsInputs {
  /**
   * @description The Quickbase API service.
   * @required
   */
  service: ApiService;
  /**
   * @description The Quickbase table Id.
   * @required
   */
  tableId: string;
  /**
   * @description The number of relationships to skip.
   */
  skip: number;
}

interface GetRelationshipsOutputs {
  result: any;
}

/**
 * @category Quickbase
 * @description  Gets the properties for all fields in a specific table.
 * @helpUrl https://developer.quickbase.com/operation/getRelationships
 * @clientOnly
 * @supportedApps EXB, GWV
 */
export default class GetRelationships implements IActivityHandler {
  /** Perform the execution logic of the activity. */
  async execute(
    inputs: GetRelationshipsInputs,
  ): Promise<GetRelationshipsOutputs> {
    const { service, tableId, skip } = inputs;
    if (!service) {
      throw new Error("service is required");
    }
    if (!tableId) {
      throw new Error("tableId is required");
    }
    const query = {
      skip,
    };
    // Remove trailing slashes
    const normalizedUrl = service.url.replace(/\/*$/, "");
    const url = `${normalizedUrl}/tables/${tableId}/relationships`;
    const headers = {
      Authorization: service.access_token,
      "Content-Type": "application/json",
      "qb-realm-hostname": service.hostName,
    };

    const options: __esri.RequestOptions = {
      query,
      responseType: "json",
      headers: headers,
    };

    const response = await esriRequest(url, options);
    const responseData = response.data;
    return {
      result: responseData,
    };
  }
}
