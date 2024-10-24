import type {
  IActivityHandler,
  IActivityContext,
} from "@vertigis/workflow/IActivityHandler";
import { 
  QuickbaseField, 
  QuickbaseRecord 
} from "../utils";
import Graphic from "@arcgis/core/Graphic";
import { MapProvider } from "@vertigis/workflow/activities/arcgis/MapProvider";
import { activate } from "@vertigis/workflow/Hooks";
import {
  load,
  project,
} from "@arcgis/core/geometry/projection";
import  { DefaultProjection } from "../utils"
interface GraphicsToQuickbaseRecordsInputs {
  /**
   * @description The Esri Graphics to convert.
   * @required
   */
  graphics: Graphic[];
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

interface GraphicsToQuickbaseRecordsOutputs {
  result: QuickbaseRecord[];
}

/**
 * @category Quickbase
 * @description Convert Esri Graphics to Quickbase records.
 * @clientOnly
 * @supportedApps EXB, GWV
 */
@activate(MapProvider)
export default class GraphicsToQuickbaseRecords implements IActivityHandler {
  async execute(
    inputs: GraphicsToQuickbaseRecordsInputs,    
    context: IActivityContext,
    type: typeof MapProvider
  ): Promise<GraphicsToQuickbaseRecordsOutputs> {
    const {
      graphics,
      quickbaseFields,
      geometryField,
      wkid,
      latField,
      longField,
    } = inputs;
    if (!graphics) {
      throw new Error("quickBaseRecords is required");
    }
    if (!quickbaseFields) {
      throw new Error("quickbaseFields is required");
    }
    const outSpatialReference = wkid ? type.getOutSR(wkid) : type.getOutSR(DefaultProjection.WGS84);
    return {
      result: await this.graphicsToQuickbaseRecords(
        graphics,
        quickbaseFields,
        outSpatialReference as __esri.SpatialReference,
        geometryField,
        latField,
        longField,
      ),
    };
  }

  async graphicsToQuickbaseRecords(
    graphics: Graphic[],
    quickbaseFields: QuickbaseField[],
    outSpatialReference: __esri.SpatialReference,
    geometryField?: QuickbaseField | number,
    latField?: QuickbaseField | number,
    longField?: QuickbaseField | number,
  ): Promise<QuickbaseRecord[]> {
    const records: QuickbaseRecord[] = [];
    for (const graphic of graphics) {
      const record = await this.graphicToQuickbaseRecord(
        graphic,
        quickbaseFields,
        outSpatialReference,
        geometryField,
        latField,
        longField,
      );
      records.push(record);
    }
    return records;
  }

  async graphicToQuickbaseRecord(
    graphic: Graphic,
    quickbaseFields: QuickbaseField[],
    outSpatialReference: __esri.SpatialReference,
    geometryField?: QuickbaseField | number,
    latField?: QuickbaseField | number,
    longField?: QuickbaseField | number,
  ): Promise<QuickbaseRecord> {
    const quickBaseRecord: QuickbaseRecord = {};
    if (graphic.geometry) {
        await load();
        const projectedGeom = project(graphic.geometry, outSpatialReference) as __esri.Geometry;
        const geomJSON = projectedGeom.toJSON();
      if (geometryField) {
        const qbGeomField =
          typeof geometryField === "number"
            ? quickbaseFields.find((x) => x.id === geometryField)
            : geometryField;
        if (qbGeomField) {
          quickBaseRecord[qbGeomField.id.toString()] = {
            value: JSON.stringify({ geometry: geomJSON }),
          };
        }
      } else if (projectedGeom.type === "point" && latField && longField) {
        const qbLatField =
          typeof latField === "number"
            ? quickbaseFields.find((x) => x.id === latField)
            : latField;
        const qbLongField =
          typeof longField === "number"
            ? quickbaseFields.find((x) => x.id === longField)
            : longField;
        if (qbLatField && qbLongField) {
          quickBaseRecord[qbLatField.id.toString()] = {
            value: (projectedGeom as __esri.Point).y.toString(),
          };
          quickBaseRecord[qbLongField.id.toString()] = {
            value: (projectedGeom as __esri.Point).x.toString(),
          };
        }
      }
      for (const key in graphic.attributes) {
        if (Array.from(key)[0] === "_") {
          const qbKey = key.substring(1);
          quickBaseRecord[qbKey] = { value: graphic.attributes[key] };
        }
      }
    }
    return quickBaseRecord;
  }
}
