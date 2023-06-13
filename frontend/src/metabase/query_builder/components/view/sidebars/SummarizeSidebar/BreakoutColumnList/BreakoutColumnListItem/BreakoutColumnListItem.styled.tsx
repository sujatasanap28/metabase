import styled from "@emotion/styled";
import { css } from "@emotion/react";
import Button from "metabase/core/components/Button";
import { Icon } from "metabase/core/components/Icon";
import {
  BinningStrategyPickerPopover as BaseBinningStrategyPickerPopover,
  TemporalBucketPickerPopover as BaseTemporalBucketPickerPopover,
} from "metabase/common/components/QueryColumnPicker/BucketPickerPopover";
import { color, alpha } from "metabase/lib/colors";

const triggerButtonStyle = css`
  border-color: transparent;
  visibility: hidden;
`;

export const BinningStrategyPickerPopover = styled(
  BaseBinningStrategyPickerPopover,
)`
  ${BaseBinningStrategyPickerPopover.TriggerButton} {
    ${triggerButtonStyle}
  }
`;

export const TemporalBucketPickerPopover = styled(
  BaseTemporalBucketPickerPopover,
)`
  ${BaseTemporalBucketPickerPopover.TriggerButton} {
    ${triggerButtonStyle}
  }
`;

export const Content = styled.div`
  display: flex;
  flex: auto;
  align-items: center;
  border-radius: 6px;
  padding-right: 0.5rem;
`;

export const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  margin-left: 0.5rem;
  padding: 0.5rem 0;
  flex-grow: 1;
`;

export const RemoveButton = styled(Button)`
  margin-left: 1rem;
  color: ${color("white")};
  background-color: transparent;

  opacity: 0.6;
  transition: all 100ms;

  &:hover {
    color: ${color("white")};
    background-color: transparent;
    opacity: 1;
  }
`;

RemoveButton.defaultProps = {
  icon: "close",
  onlyIcon: true,
  borderless: true,
};

export const AddButton = styled(Button)`
  width: 34px;
  margin-left: 0.5rem;
  color: ${color("white")};
  transition: none;
`;

AddButton.defaultProps = {
  icon: "add",
  onlyIcon: true,
  borderless: true,
};

export const ColumnTypeIcon = styled(Icon)`
  color: ${color("text-medium")};
`;

export const Title = styled.div`
  margin: 0 0.5rem;
  word-break: break-word;
  font-size: 0.875rem;
  font-weight: 700;
`;

const selectedStyle = css`
  ${Content},
  ${ColumnTypeIcon} {
    background-color: ${color("summarize")};
    color: ${color("white")};
  }

  ${BaseBinningStrategyPickerPopover.TriggerButton}, ${BaseTemporalBucketPickerPopover.TriggerButton} {
    visibility: visible;
    color: ${alpha("white", 0.5)};
    border-color: ${alpha("text-dark", 0.1)};
  }

  ${BaseBinningStrategyPickerPopover.TriggerButton}:hover, ${BaseTemporalBucketPickerPopover.TriggerButton}:hover {
    color: ${color("white")};
  }
`;

const unselectedStyle = css`
  &:hover {
    ${Content},
    ${ColumnTypeIcon},
    ${AddButton} {
      color: ${color("summarize")};
      background-color: ${color("bg-light")};
    }

    ${AddButton}:hover {
      background-color: ${color("bg-medium")};
    }

    ${BaseBinningStrategyPickerPopover.TriggerButton}, ${BaseTemporalBucketPickerPopover.TriggerButton} {
      visibility: visible;
      color: ${color("text-light")};
      border-color: ${alpha("text-dark", 0.1)};
    }

    ${BaseBinningStrategyPickerPopover.TriggerButton}:hover, ${BaseTemporalBucketPickerPopover.TriggerButton}:hover {
      color: ${color("text-medium")};
    }
  }
`;

export const Root = styled.li<{ isSelected: boolean }>`
  display: flex;
  align-items: stretch;
  cursor: pointer;
  margin: 0.25rem 0;
  min-height: 34px;

  ${props => (props.isSelected ? selectedStyle : unselectedStyle)}
`;
