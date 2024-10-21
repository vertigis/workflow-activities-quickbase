import type { IActivityHandler } from "@vertigis/workflow";
import QuickbaseService from "../QuickbaseService";
import { get } from "../request";


interface GetRelationshipsInputs {
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
   * @description The number of relationships to skip.
   */
  skip: number;
}

interface GetRelationshipsOutputs {
  result: {
    metadata: {
      numRelationships: number;
      skip: number;
      totalRelationships: number;
    },
    relationships: [
      {
        childTableId: string;
        foreignKeyField: {
          id: number;
          label: string;
          type: string;
        },
        id: number;
        isCrossApp: boolean;
        lookupFields: {
          id: number;
          label: string;
          type: string;
        }[];
        parentTableId: string,
        summaryFields: {
          id: number;
          label: string;
          type: string;
        }[];

      }
    ]
  };
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
    const path = `/tables/${tableId}/relationships`;
    const response = await get(service, tableId, path, query)
    return {
      result: response,
    };
  }
}
