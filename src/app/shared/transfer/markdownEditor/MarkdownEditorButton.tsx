import React, { MouseEvent, useCallback, useContext } from 'react';
import { Button } from 'semantic-ui-react';

import { Dispatch } from './keymap';
import { MarkdownEditorContext } from './MarkdownEditorContext';
import { MenuItem } from './MarkdownEditorHeader';

interface MenuButtonProps {
  dispatch: Dispatch;
  button: MenuItem;
}

export const MarkdownEditorButton: React.FC<MenuButtonProps> = ({
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
