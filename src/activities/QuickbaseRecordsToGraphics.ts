import type {
  IActivityHandler,
  IActivityContext,
} from "@vertigis/workflow/IActivityHandler";
import { activate } from "@vertigis/workflow/Hooks";
import {
  QuickbaseField,
  QuickbaseQueryResult,
  quickbaseToEsriField,
  quickbaseToEsriFields,
} from "../utils";
import Graphic from "@arcgis/core/Graphic";
import * as jsonUtils from "@arcgis/core/geometry/support/jsonUtils";
import {
  load,
  project,
} from "@arcgis/core/geometry/projection";
import { MapProvider } from "@vertigis/workflow/activities/arcgis/MapProvider";
import { DefaultProjection } from "../utils"



interface QuickbaseRecordsToGraphicsInputs {
  /**
   * @description The Quickbase records to convert.
   * @required
   */
  quickBaseRecords: QuickbaseQueryResult;
  /**
   * @description The Quickbase field definitions for the target records.
   * @required
   */
  quickbaseFields: QuickbaseField[];
  /**
   * @description The Quickbase field or field Id holding the geometry.  Necessary for Polygon and Polyline geometries.
   */
  geometryField?: QuickbaseField | number;
  /**
   * @description The Quickbase field or field Id holding the latitude value.  Necessary for Point geometries.
   */
  latField?: QuickbaseField | number;
  /**
   * @description TThe Quickbase field or field Id holding the longitude value.  Necessary for Point geometries.
   */
  longField?: QuickbaseField | number;
  /**
   * @description The Well Known Text number of the target spatial reference.  Defaults to 4326.
   */
  wkid?: number;
}

interface QuickbaseRecordsToGraphicsOutputs {
  result: __esri.Graphic[];
}

/**
 * @category Quickbase
 * @description Convert Quickbase records to Esri Graphics.
 * @clientOnly
 * @supportedApps EXB, GWV
 */
@activate(MapProvider)
export default class QuickbaseRecordsToGraphics implements IActivityHandler {

  async execute(
    inputs: QuickbaseRecordsToGraphicsInputs,
    context: IActivityContext,
    type: typeof MapProvider
  ): Promise<QuickbaseRecordsToGraphicsOutputs> {
    const {
      quickBaseRecords,
      quickbaseFields,
      wkid,
      geometryField,
      latField,
      longField,
    } = inputs;
    if (!quickBaseRecords) {
      throw new Error("quickBaseRecords is required");
    }
    if (!quickbaseFields) {
      throw new Error("quickbaseFields is required");
    }

    const outSpatialReference = wkid ? type.getOutSR(wkid) : type.getOutSR(DefaultProjection.WGS84);
    const graphics = await this.quickBaseRecordsToGraphics(
      quickBaseRecords,
      quickbaseFields,
      outSpatialReference as __esri.SpatialReference,
      geometryField,
      latField,
      longField,
    );

    return {
      result: graphics,
    };
  }

  async quickBaseRecordsToGraphics(
    quickBaseRecords: QuickbaseQueryResult,
    quickbaseFields: QuickbaseField[],
    outSpatialReference: __esri.SpatialReference,
    geometryField?: QuickbaseField | number,
    latField?: QuickbaseField | number,
    longField?: QuickbaseField | number,
  ): Promise<Graphic[]> {
    const graphics: Graphic[] = [];
    let index = 0;
    for (const qbRecord of quickBaseRecords.data) {
      const graphic = await this.quickBaseRecordToGraphic(
        qbRecord,
        quickbaseFields,
        index,
        outSpatialReference,
        geometryField,
        latField,
        longField,
      );
      graphics.push(graphic);
      index++;
    }
    return graphics;
  }

  async quickBaseRecordToGraphic(
    quickBaseRecord: Record<string, { value: any }>,
    quickbaseFields: QuickbaseField[],
    index: number,
    outSpatialReference: __esri.SpatialReference,
    geometryField?: QuickbaseField | number,
    latField?: QuickbaseField | number,
    longField?: QuickbaseField | number,
  ): Promise<Graphic> {
    const graphic = new Graphic({ attributes: { objectid: index } });
    let geomJSON;
    if (geometryField) {
      const geomVal = this.getFieldValue(geometryField, quickBaseRecord, quickbaseFields);
      if (geomVal) {
        const qbGeom = JSON.parse(geomVal as string);
        geomJSON = qbGeom.geometry;
      }
    } else if (latField && longField) {
      //Lat/Long fields are stored in WGS84
      const longVal = this.getFieldValue(longField, quickBaseRecord, quickbaseFields);
      const latVal = this.getFieldValue(latField, quickBaseRecord, quickbaseFields);
      if (longVal && latVal) {
        geomJSON = {
          x: parseFloat(longVal as string),
          y: parseFloat(latVal as string),
          spatialReference: { wkid: DefaultProjection.WGS84 },
        };
      }
    }
    if (geomJSON) {
      const geom = jsonUtils.fromJSON(geomJSON);
      if (!outSpatialReference.isWGS84) {
        await load();
        const projectedGeom = project(geom, outSpatialReference);
        graphic.geometry = projectedGeom as __esri.Geometry;
      }
      graphic.geometry = geom;
    }

    quickbaseFields.forEach((field: QuickbaseField) => {
      this.setGraphicAttribute(graphic, field, quickBaseRecord);
    });
    return graphic;
  }

  findQuickbaseField(field: number | QuickbaseField, quickbaseFields: QuickbaseField[]): QuickbaseField | undefined {
    const qbField =
      typeof field === "number"
        ? quickbaseFields.find((x) => x.id === field)
        : field;
    return qbField;
  }

  getFieldValue(field: number | QuickbaseField, quickBaseRecord: Record<string, { value: any }>, quickbaseFields: QuickbaseField[]): any {
    const qbField = this.findQuickbaseField(field, quickbaseFields);
    if (qbField) {
      const recordVal = quickBaseRecord[qbField.id];
      if (recordVal) {
        return recordVal.value;
      }
    }
    return undefined;
  }

  setGraphicAttribute(graphic: __esri.Graphic, qbField: QuickbaseField, quickBaseRecord: Record<string, { value: any }>): void {
    if (qbField) {
      const recordVal = quickBaseRecord[qbField.id];
      if (recordVal) {
        const targetField = quickbaseToEsriField(qbField);
        if (targetField) {
          switch (targetField.type) {
            case "string":
              graphic.attributes[`_${qbField.id}`] = recordVal.value as "string";
              break;
            case "integer":
            case "double":
              graphic.attributes[`_${qbField.id}`] = recordVal.value as "number";
              break;
            case "date":
            case "date-only":
            case "time-only":
              graphic.attributes[`_${qbField.id}`] = Date.parse(recordVal.value as string);
              break;
            default:
              graphic.attributes[`_${qbField.id}`] = recordVal.value as "string";
          }
        }
      }
    }
  }
}
