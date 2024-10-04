import type {
  IActivityHandler,
  IActivityContext,
} from "@vertigis/workflow/IActivityHandler";
import { activate } from "@vertigis/workflow/Hooks";
import {
  QuickbaseField,
  QuickbaseQueryResult,
  quickbaseToEsriField,
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
   * @description The field id for the geometry field defined in the Quickbase table.  Necessary for Polygon and Polyline geometries.
   */
  geometryField?: number;
  /**
   * @description The latitude field defined in the Quickbase table.  Necessary for Point geometries.
   */
  latField?: number;
  /**
   * @description The longitude field defined in the Quickbase table.  Necessary for Point geometries.
   */
  longField?: number;
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
    geometryField?: number,
    latField?: number,
    longField?: number,
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
    geometryField?: number,
    latField?: number,
    longField?: number,
  ): Promise<Graphic> {
    const graphic = new Graphic({ attributes: { objectid: index } });
    let geomJSON;
    if (
      geometryField &&
      quickBaseRecord[geometryField] &&
      quickBaseRecord[geometryField].value
    ) {
      const qbGeom = JSON.parse(quickBaseRecord[geometryField].value as string);
      geomJSON = qbGeom.geometry;
    } else if (
      latField &&
      longField &&
      quickBaseRecord[latField] &&
      quickBaseRecord[longField] &&
      quickBaseRecord[latField].value &&
      quickBaseRecord[longField].value
    ) {
      //Lat/Long fields are stored in WGS84
      geomJSON = {
        x: parseFloat(quickBaseRecord[longField].value as string),
        y: parseFloat(quickBaseRecord[latField].value as string),
        spatialReference: { wkid: DefaultProjection.WGS84 },
      };

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
      const targetField = quickbaseToEsriField(field);
      if (
        targetField &&
        quickBaseRecord[field.id] 
      ) {
        switch (targetField.type) {
          case "string":
            graphic.attributes[`_${field.id}`] =
              quickBaseRecord[field.id].value;
            break;
          case "integer":
            graphic.attributes[`_${field.id}`] = quickBaseRecord[field.id]
              .value as number;
            break;
          case "date":
          case "date-only":
          case "time-only":
            graphic.attributes[`_${field.id}`] = Date.parse(
              quickBaseRecord[field.id].value as string,
            );
            break;
          case "double":
            graphic.attributes[`_${field.id}`] = quickBaseRecord[field.id].value as number;
            break;
          default:
            graphic.attributes[`_${field.id}`] =
              quickBaseRecord[field.id].value;
        }
      }
    });
    return graphic;
  }
}
