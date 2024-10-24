import type { IActivityHandler } from "@vertigis/workflow";
import QuickbaseService from "../QuickbaseService";
import { post } from "../request";
interface QueryRecordsInputs {
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
   * @description The field Ids of the Quickbase table.
   * @required
   */
  select: number[];
  /**
   * @description The filter, using the Quickbase query language, which determines the records to return. 
   *              If this parameter is omitted, the query will return all records.
   */
  where: number[];
  /**
   * @description An array that contains the fields to group the records by.
   */
  groupBy: number[];
  /**
   * @description The field Id to sort by.An array of field IDs and sort directions.
   */
  sortBy: {
    fieldId: number;
    order: string;
  }[];
}

interface QueryRecordsOutputs {
  result: {
    data: Record<string, { value: any}>[];
    fields:  {
      id: number;
      label: string;
      type: string;
    }[];
    metadata: {
      totalRecords: number;
      numRecords: number;
      numFields: number;
      skip: number;
    },
  };
}

/**
 * @category Quickbase
 * @description Pass in a query in the Quickbase query language. Returns record data with intelligent pagination based
 *              on the approximate size of each record. The metadata object will include the necessary information to
 *              iterate over the response and gather more data.
 * @helpUrl https://developer.quickbase.com/operation/runQuery
 * @clientOnly
 * @supportedApps EXB, GWV
 */
export default class QueryRecords implements IActivityHandler {
  async execute(inputs: QueryRecordsInputs): Promise<QueryRecordsOutputs> {
    const { service, from, select, where, groupBy, sortBy } = inputs;
    if (!service) {
      throw new Error("service is required");
    }
    if (!from) {
      throw new Error("from is required");
    }
    if (!select) {
      throw new Error("select is required");
    }
    const body = {
      from,
      select,
      where,
      groupBy,
      sortBy,
    };
    const path = `/records/query`;
    const response = await post(service, from, path, body)
    return {
      result: response,
    };
  }
}
