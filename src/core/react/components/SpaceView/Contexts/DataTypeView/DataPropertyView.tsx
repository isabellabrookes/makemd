import { showNewPropertyMenu } from "core/react/components/UI/Menus/contexts/newSpacePropertyMenu";
import { parseFieldValue } from "core/schemas/parseFieldValue";
import { CollapseToggleSmall } from "core/react/components/UI/Toggles/CollapseToggleSmall";
import i18n from "shared/i18n";
import React, { useMemo, useState } from "react";
import { windowFromDocument } from "shared/utils/dom";
import { parseObject } from "utils/parsers";
import { propertyIsObjectType } from "utils/properties";
import { PropertyField } from "../ContextBuilder/ContextListEditSelector";
import { CellEditMode } from "../TableView/TableView";
import { DataTypeView, DataTypeViewProps } from "./DataTypeView";
import { ObjectType } from "./ObjectCell";
export type DataPropertyViewProps = DataTypeViewProps & {
  propertyMenu?: (e: React.MouseEvent) => void;
  linkProp?: (e: React.MouseEvent) => void;
  linkedProp?: string;
  linkedColor?: string;
  path?: string;
  contexts?: string[];
  draggable?: boolean;
};
export const DataPropertyView = (props: DataPropertyViewProps) => {
  const isObjectType = useMemo(
    () => propertyIsObjectType(props.column),
    [props.column]
  );

  const parsedValue = parseFieldValue(props.column.value, props.column.type);
  const saveType = (newType: ObjectType, _value: Record<string, string>) => {
    const value = parseObject(
      props.initialValue ?? "",
      props.column.type == "object-multi"
    );
    if (props.column.type == "object-multi") {
      props.updateFieldValue(
        JSON.stringify({ ...parsedValue, type: newType }),
        JSON.stringify(value)
      );
    } else {
      props.updateFieldValue(
        JSON.stringify({ ...parsedValue, type: newType }),
        JSON.stringify(_value)
      );
    }
  };

  const newProperty = (e: React.MouseEvent) => {
    const offset = (e.target as HTMLElement).getBoundingClientRect();
    const type = parseFieldValue(props.column.value, props.column.type)?.type;
    const value = parseObject(
      props.initialValue ?? "",
      props.column.type == "object-multi"
    );
    showNewPropertyMenu(
      props.superstate,
      offset,
      windowFromDocument(e.view.document),
      {
        spaces: [],
        fields: [],
        saveField: (source, field) => {
          saveType(
            {
              ...(type ?? {}),
              [field.name]: { type: field.type, label: field.name },
            },
            {
              ...value,
              [field.name]: "",
            }
          );
          return true;
        },
        fileMetadata: true,
      }
    );
  };

  const insertMultiValue = (index: number) => {
    const type = parseFieldValue(props.column.value, props.column.type)?.type;
    const value = parseObject(
      props.initialValue ?? "",
      props.column.type == "object-multi"
    );
    const item = Object.keys(type).reduce((p, c) => ({ ...p, [c]: "" }), {});
    props.updateValue(
      JSON.stringify([...value.slice(0, index), item, ...value.slice(index)])
    );
  };
  const [collapsed, setCollapsed] = useState<boolean>(true);
  return !props.compactMode ? (
    <>
      <div className="mk-path-context-row">
        <PropertyField
          superstate={props.superstate}
          path={props.path}
          property={props.column}
          onClick={(e) => props.propertyMenu && props.propertyMenu(e)}
          contexts={props.contexts}
          draggable={props.draggable}
        ></PropertyField>
        {isObjectType && (
          <CollapseToggleSmall
            superstate={props.superstate}
            collapsed={collapsed}
            onToggle={(c) => setCollapsed(c)}
          />
        )}

        <div className="mk-path-context-value">
          {props.linkProp && (
            <div
              className="mk-icon-small"
              style={{ height: "24px", fill: props.linkedColor }}
              onClick={(e) => props.linkProp(e)}
              dangerouslySetInnerHTML={{
                __html: props.superstate.ui.getSticker(
                  props.linkedProp ? "ui//circle-solid" : "ui//circle"
                ),
              }}
            ></div>
          )}
          {props.linkedProp ? (
            <div className="mk-active">{props.linkedProp}</div>
          ) : isObjectType ? null : (
            <DataTypeView {...props}></DataTypeView>
          )}
        </div>
      </div>
      {isObjectType && !props.compactMode && !collapsed && (
        <div className="mk-path-context-row" style={{ marginLeft: "30px" }}>
          <DataTypeView {...props}></DataTypeView>
        </div>
      )}
    </>
  ) : (
    <div>
      <DataTypeView {...props}></DataTypeView>
    </div>
  );
};
