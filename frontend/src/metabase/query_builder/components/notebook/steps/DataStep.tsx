import { useMemo } from "react";
import { connect } from "react-redux";
import { t } from "ttag";

import { DataSourceSelector } from "metabase/query_builder/components/DataSelector";
import { getDatabasesList } from "metabase/query_builder/selectors";
import { FieldPicker } from "metabase/common/components/FieldPicker";

import type { TableId } from "metabase-types/api";
import * as Lib from "metabase-lib";
import type { NotebookStepUiComponentProps } from "../types";
import { NotebookCell, NotebookCellItem } from "../NotebookCell";
import {
  FieldPickerContentContainer,
  FIELDS_PICKER_STYLES,
} from "../FieldsPickerIcon";

function DataStep({
  topLevelQuery,
  query,
  step,
  color,
  updateQuery,
  readOnly,
}: NotebookStepUiComponentProps) {
  const question = query.question();
  const table = query.table();
  const canSelectTableColumns = table && query.isRaw() && !readOnly;

  return (
    <NotebookCell color={color}>
      <NotebookCellItem
        color={color}
        inactive={!table}
        right={
          canSelectTableColumns && (
            <DataFieldsPicker
              query={topLevelQuery}
              stageIndex={step.stageIndex}
              updateQuery={updateQuery}
            />
          )
        }
        containerStyle={FIELDS_PICKER_STYLES.notebookItemContainer}
        rightContainerStyle={FIELDS_PICKER_STYLES.notebookRightItemContainer}
        data-testid="data-step-cell"
      >
        <DataSourceSelector
          hasTableSearch
          collectionId={question.collectionId()}
          databaseQuery={{ saved: true }}
          selectedDatabaseId={query.databaseId()}
          selectedTableId={query.tableId()}
          setSourceTableFn={(tableId: TableId) =>
            updateQuery(query.setTableId(tableId).setDefaultQuery())
          }
          isInitiallyOpen={!query.tableId()}
          triggerElement={
            <FieldPickerContentContainer>
              {table ? table.displayName() : t`Pick your starting data`}
            </FieldPickerContentContainer>
          }
        />
      </NotebookCellItem>
    </NotebookCell>
  );
}

// eslint-disable-next-line import/no-default-export -- deprecated usage
export default connect(state => ({ databases: getDatabasesList(state) }))(
  DataStep,
);

interface DataFieldsPickerProps {
  query: Lib.Query;
  stageIndex: number;
  updateQuery: (query: Lib.Query) => Promise<void>;
}

const DataFieldsPicker = ({
  query,
  stageIndex,
  updateQuery,
}: DataFieldsPickerProps) => {
  const columns = useMemo(
    () => Lib.fieldableColumns(query, stageIndex),
    [query, stageIndex],
  );

  const items = useMemo(
    () => columns.map(column => Lib.displayInfo(query, stageIndex, column)),
    [query, stageIndex, columns],
  );

  const isAll = useMemo(
    () => items.every(displayInfo => displayInfo.selected),
    [items],
  );

  const isNone = useMemo(
    () => items.every(displayInfo => !displayInfo.selected),
    [items],
  );

  const handleSelect = (changedIndex: number) => {
    const nextColumns = items
      .map((displayInfo, currentIndex) =>
        currentIndex !== changedIndex
          ? displayInfo.selected
          : !displayInfo.selected,
      )
      .map((_, currentIndex) => columns[currentIndex]);
    const nextQuery = Lib.withFields(query, stageIndex, nextColumns);
    updateQuery(nextQuery);
  };

  const handleSelectAll = () => {
    const nextQuery = Lib.withFields(query, stageIndex, []);
    updateQuery(nextQuery);
  };

  const handleSelectNone = () => {
    const nextQuery = Lib.withFields(query, stageIndex, [columns[0]]);
    updateQuery(nextQuery);
  };

  return (
    <FieldPicker
      items={items}
      isAll={isAll}
      isNone={isNone}
      onSelect={handleSelect}
      onSelectAll={handleSelectAll}
      onSelectNone={handleSelectNone}
    />
  );
};
