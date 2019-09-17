import React, { MouseEvent, useCallback, useContext } from 'react';
import { Button } from 'semantic-ui-react';

import { MarkdownEditorContext } from './MarkdownEditorContext';
import { IMenuItem } from './MarkdownEditorHeader';

interface IMenuButtonProps {
  button: IMenuItem;
}

export const MarkdownEditorButton: React.FC<IMenuButtonProps> = ({
  button: { icon, active, enabled: enable, onClick, title }
}) => {
  const { editorState, dispatchTransaction } = useContext(MarkdownEditorContext);

  const onClickCallback = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      onClick(editorState, dispatchTransaction);
    },
    [editorState, dispatchTransaction, onClick]
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
