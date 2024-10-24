import type { IActivityHandler } from "@vertigis/workflow";
import { QuickbaseField, quickbaseToEsriFields } from "../utils";

interface QuickbaseToEsriFieldsInputs {
  /**
   * @description The QuickBase fields to convert to Esri fields.
   * @required
   */
  quickBaseFields: QuickbaseField[];
}

interface QuickbaseToEsriFieldsOutputs {
  /**
   * @description The result of the activity.
   */
  result: __esri.Field[];
}

/**
 * @category Quickbase
 * @description Converts Quickbase fields to Esri fields.
 * @helpUrl https://helpv2.quickbase.com/hc/en-us/sections/4572535340308-Fields
 * @clientOnly
 * @supportedApps EXB, GWV
 */
export default class QuickbaseToEsriFields implements IActivityHandler {
  execute(inputs: QuickbaseToEsriFieldsInputs): QuickbaseToEsriFieldsOutputs {
    const quickBaseFields = inputs.quickBaseFields;

    if (!quickBaseFields) {
      throw new Error("quickBaseFields is required");
    }

    const esriFields = quickbaseToEsriFields(quickBaseFields);
    return {
      result: esriFields,
    };
  }
}
