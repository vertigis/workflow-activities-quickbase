import type { IActivityHandler } from "@vertigis/workflow";
import QuickbaseService from "../QuickbaseService";
import { httpDelete } from "../request";
interface DeleteRecordsInputs {
  /**
   * @description The Quickbase API service.
   * @required
   */
  service: QuickbaseService;
  /**
   * @description The unique identifier (dbid) of the table.
   * @required
   */
  from: string;
  /**
   * @description The filter to delete records. To delete all records specify a filter that will include all records, 
   *              for example {3.GT.0} where 3 is the ID of the Record ID field.
   * @required
   */
  where: Record<string, { value: any }>[];
}

interface DeleteRecordsOutputs {
  result: {
    numberDeleted: number;
  };
}

/**
 * @category Quickbase
 * @description Deletes record(s) in a table based on a query.
 * @helpUrl https://developer.quickbase.com/operation/deleteRecords
 * @clientOnly
 * @supportedApps EXB, GWV
 */
export default class DeleteRecords implements IActivityHandler {
  async execute(inputs: DeleteRecordsInputs): Promise<DeleteRecordsOutputs> {
    const { service, from, where } = inputs;
    if (!service) {
      throw new Error("service is required");
    }
    if (!from) {
      throw new Error("from is required");
    }
    if (!where) {
      throw new Error("where is required");
    }
    const body = {
      from,
      where,
    };
    const response = await httpDelete(service, from, "/records", body)

    return {
      result: response,
    };
  }
}
