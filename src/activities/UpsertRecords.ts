import type { IActivityHandler } from "@vertigis/workflow";
import { ApiService } from "../ApiService";
import esriRequest from "@arcgis/core/request";

interface UpsertRecordsInputs {
  /**
   * @description The Quickbase API service.
   * @required
   */
  service: ApiService;
  /**
   * @description The unique identifier (dbid) of the table.
   * @required
   */
  to: string;
  /**
   * @description Record data array, where each record contains key-value mappings of fields to be defined/updated and their values.
   * @required
   */
  data: Record<string, { value: any }>[];
  /**
   * @description The merge field id.
   */
  mergeFieldId: number;
  /**
   * @description Specify an array of field ids that will return data for any updates or added record. 
   *              Record ID (FID 3) is always returned if any field ID is requested.
   */
  fieldsToReturn: number[];
}

interface UpsertRecordsOutputs {
  result: {
    data: Record<string, any>[];
    metadata: {
      createdRecordIds: number[];
      totalNumberOfRecordsProcessed: number;
      unchangedRecordIds: number[];
      updatedRecordIds: number[];
    };
  };
}

/**
 * @category Quickbase
 * @description Insert and/or update record(s) in a table. In this single API call, inserts and updates can be submitted.
 *              Update can use the key field on the table, or any other supported unique field. This operation allows for
 *              incremental processing of successful records, even when some of the records fail.
 *              Note: Maximum payload size is 40MB.
 * @helpUrl https://developer.quickbase.com/operation/upsert
 * @clientOnly
 * @supportedApps EXB, GWV
 */
export default class UpsertRecords implements IActivityHandler {
  async execute(inputs: UpsertRecordsInputs): Promise<UpsertRecordsOutputs> {
    const { service, to, data, mergeFieldId, fieldsToReturn } = inputs;
    if (!service) {
      throw new Error("service is required");
    }
    if (!to) {
      throw new Error("to is required");
    }
    if (!data) {
      throw new Error("data is required");
    }
    // Remove trailing slashes
    const normalizedUrl = service.url.replace(/\/*$/, "");
    const url = `${normalizedUrl}/records`;
    const headers = {
      Authorization: service.access_token,
      "Content-Type": "application/json",
      "qb-realm-hostname": service.hostName,
    };

    const query = {
      to,
      data,
      mergeFieldId,
      fieldsToReturn,
    };
    const body = JSON.stringify(query);
    const options: __esri.RequestOptions = {
      method: "post",
      body,
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
