import type { IActivityHandler } from "@vertigis/workflow";
import { ApiService } from "../ApiService";
import esriRequest from "@arcgis/core/request";

interface GetFieldsInputs {
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
   * @description Set to 'true' to include any custom permissions for the field(s).
   */
  includeFieldPerms: boolean;
}

interface GetFieldsOutputs {
  /**
   * @description The list of field definitions.
   */
  result: {
    id: number;
    label: string;
    fieldType: string;
    noWrap: boolean;
    bold: boolean;
    required: boolean;
    appearsByDefault: boolean;
    findEnabled: boolean;
    unique: boolean;
    doesDataCopy: boolean;
    fieldHelp: string;
    audited: boolean;
    properties: {
      primaryKey: boolean;
      foreignKey: boolean;
      numLines: number;
      maxLength: number;
      appendOnly: boolean;
      allowHTML: boolean;
      allowMentions: boolean;
      sortAsGiven: boolean;
      carryChoices: true;
      allowNewChoices: boolean;
      formula: string;
      defaultValue: string;
    };
    permissions: {
      permissionType: string;
      role: string;
      roleId: number;
    }[];
  }[];
}

/**
 * @category Quickbase
 * @description  Gets the properties for all fields in a specific table.
 * @helpUrl https://developer.quickbase.com/operation/getFields
 * @clientOnly
 * @supportedApps EXB, GWV
 */
export default class GetFields implements IActivityHandler {
  async execute(inputs: GetFieldsInputs): Promise<GetFieldsOutputs> {
    const { service, tableId, includeFieldPerms } = inputs;
    if (!service) {
      throw new Error("service is required");
    }
    if (!tableId) {
      throw new Error("tableId is required");
    }
    const query = {
      tableId,
      includeFieldPerms,
    };
    // Remove trailing slashes
    const normalizedUrl = service.url.replace(/\/*$/, "");
    const url = `${normalizedUrl}/fields`;
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
