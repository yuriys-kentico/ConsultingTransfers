import { EditorState, Transaction } from 'prosemirror-state';
import React, { MouseEvent, useCallback } from 'react';
import { Menu } from 'semantic-ui-react';

import { MenuItem } from './MenuBar';

interface Props {
  state: EditorState;
  dispatch: (tr: Transaction) => void;
  item: MenuItem;
}

export const MenuButton: React.FC<Props> = props => {
  const { state, dispatch, item } = props;

  const isActive = !!item.active && item.active(state);
  const isDisabled = !!item.enable && !item.enable(state);

  const onClick = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      item.run(state, dispatch);
    },
    [item, state, dispatch]
  );

  return <Menu.Item icon={item.content} disabled={isDisabled} onClick={onClick} active={isActive} />;
};
