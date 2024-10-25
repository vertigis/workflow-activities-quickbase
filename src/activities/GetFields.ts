import type { IActivityHandler } from "@vertigis/workflow";
import QuickbaseService from "../QuickbaseService";
import { get } from "../request";

interface GetFieldsInputs {
  /**
   * @description The Quickbase API service.
   * @required
   */
  service: QuickbaseService;
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
    const { service, tableId, includeFieldPerms = false } = inputs;
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
   
    const response = await get(service, tableId, "/fields", query)

    return {
      result: response,
    };
  }
}
