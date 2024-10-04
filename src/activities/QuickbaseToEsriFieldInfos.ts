import type { IActivityHandler } from "@vertigis/workflow";
import { QuickbaseField } from "../utils";
import FieldInfo from "@arcgis/core/popup/FieldInfo";

interface QuickbaseToEsriFieldInfosInputs {
  /**
   * @description The QuickBase fields to convert to Esri field infos.
   * @required
   */
  quickBaseFields: QuickbaseField[];
}

interface QuickbaseToEsriFieldInfosOutputs {
  result: FieldInfo[];
}

/**
 * @category Quickbase
 * @description Converts Quickbase fields to Esri Field Infos.
 * @helpUrl https://helpv2.quickbase.com/hc/en-us/sections/4572535340308-Fields
 * @clientOnly
 * @supportedApps EXB, GWV
 */
export default class QuickbaseToEsriFieldInfos implements IActivityHandler {
  execute(
    inputs: QuickbaseToEsriFieldInfosInputs,
  ): QuickbaseToEsriFieldInfosOutputs {
    const quickBaseFields = inputs.quickBaseFields;

    if (!quickBaseFields) {
      throw new Error("quickBaseFields is required");
    }

    const esriFieldInfos = this.convert(quickBaseFields);

    return {
      result: esriFieldInfos,
    };
  }
  convert(quickBaseFields: QuickbaseField[]): FieldInfo[] {
    const fieldInfos: __esri.FieldInfo[] = [];
    quickBaseFields.forEach((qbField) => {
      const fieldInfo = new FieldInfo({
        fieldName: `_${qbField.id}`,
        isEditable: true,
        label: qbField.label,
        visible: true,
      });
      fieldInfos.push(fieldInfo);
    });
    return fieldInfos;
  }
}
