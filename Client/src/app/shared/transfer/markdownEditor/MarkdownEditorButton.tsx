import React, { MouseEvent, useCallback, useContext } from 'react';
import { Button } from 'semantic-ui-react';

import { Dispatch } from './keymap';
import { MarkdownEditorContext } from './MarkdownEditorContext';
import { IMenuItem } from './MarkdownEditorHeader';

interface IMenuButtonProps {
  dispatch: Dispatch;
  button: IMenuItem;
}

export const MarkdownEditorButton: React.FC<IMenuButtonProps> = ({
  dispatch,
  button: { icon, active, enabled: enable, onClick, title }
}) => {
  const { editorState } = useContext(MarkdownEditorContext);

  const onClickCallback = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      onClick(editorState, dispatch);
    },
    [editorState, dispatch]
  );

  return (
    <Button
      icon={icon}
      title={title}
      disabled={enable && !enable(editorState)}
      onClick={onClickCallback}
      active={active && active(editorState)}
    />
  );
};
