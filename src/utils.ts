import Field from "@arcgis/core/layers/support/Field";


export const DefaultProjection = {
  WGS84: 4326,
}
export interface QuickbaseQueryResult {
  data: Record<
    string,
    {
      value:
      | string
      | number
      | Record<string, string | number>
      | Record<string, string | number>[];
    }
  >[];
  fields: {
    id: number;
    label: string;
    type: string;
  }[];
  metadata: {
    totalRecords: number;
    numRecords: number;
    numField: number;
    skip: number;
  };
}

export interface QuickbaseRecord
  extends Record<
    string,
    {
      value:
      | string
      | number
      | Record<string, string | number>
      | Record<string, string | number>[];
    }
  > { }

export interface QuickbaseField {
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
  properties: QuickbaseFieldProps;
  permissions: QuickbaseFieldPermissions[];
}

export interface QuickbaseFieldProps {
  primaryKey: boolean;
  foreignKey: boolean;
  numLines: number;
  maxLength: number;
  appendOnly: boolean;
  allowHTML: boolean;
  allowMentions: boolean;
  sortAsGiven: boolean;
  carryChoices: boolean;
  numberFormat: number;
  allowNewChoices: boolean;
  formula: string;
  defaultValue: string;
  decimalPlaces: number;
  compositeFields: QuickbaseCompositeFieldDef;
}

export interface QuickbaseCompositeFieldDef {
  id: number;
  isHidden: boolean;
  key: string;
}
export interface QuickbaseFieldPermissions {
  permissionType: string;
  role: string;
  roleId: number;
}

export function quickbaseToEsriFields(
  qbFields: QuickbaseField[],
): __esri.Field[] {
  const esriFields: __esri.Field[] = [];
  qbFields.forEach((field: QuickbaseField) => {
    const esriField = quickbaseToEsriField(field);
    if (esriField) {
      esriFields.push(esriField);
    }
  });
  const oidField = new Field({
    type: "oid",
    name: `objectid`,
    alias: "Object ID",
    editable: false,
    nullable: false,
  });
  esriFields.push(oidField);

  return esriFields;
}

export function quickbaseToEsriField(
  qbField: QuickbaseField,
): __esri.Field | undefined {
  const type = convertFieldType(qbField);
  //only add supported types
  if (type) {
    const esriField = new Field({
      type: type as any,
      name: `_${qbField.id}`,
      alias: qbField.label,
      editable: true,
      nullable: true,
    });
    //TODO: Discuss how geometries are managed in Quickbase with the Quickbase team. This is fragile.
    if (
      esriField.alias.toLowerCase() === "geometry" ||
      esriField.alias.toLowerCase() === "lat" ||
      esriField.alias.toLowerCase() === "long"
    ) {
      esriField.editable = false;
    }
    return esriField;
  }
  return undefined;
}

export function convertFieldType(
  quickbaseField: QuickbaseField,
): string | undefined {
  /**
   * Quickbase has a number of non-SQL data types that are not supported by the Esri Field type.
   * Unsupported quickbase types:
   * multitext
   * list-user
   * file
   * icalendar
   * vcard
   * reference
   * summary
   * lookup
   * formula
   * report-link
   * work date
   * dblink
   */
  let type;
  switch (quickbaseField.fieldType) {
    case "text":
    case "rich-text":
    case "text-multi-line":
    case "text-multiple-choice":
    case "address":
    case "email":
    case "phone":
    case "user":
    case "url":
    case "checkbox":
      type = "string";
      break;
    case "rating":
    case "recordid":
    case "duration":
      type = "integer";
      break;
    case "numeric":
    case "currency":
    case "percent":
      type = "double";
      break;
    case "timeofday":
      type = "time-only";
      break;
    case "date":
      type = "date-only";
      break;
    case "datetime":
    case "timestamp":
      type = "date";
      break;
  }
  return type;
}

