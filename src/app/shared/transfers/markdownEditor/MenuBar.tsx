import { createStyles, makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { setBlockType, toggleMark } from 'prosemirror-commands';
import { redo, undo } from 'prosemirror-history';
import { schema } from 'prosemirror-markdown';
import { MarkType, NodeType } from 'prosemirror-model';
import { wrapInList } from 'prosemirror-schema-list';
import { EditorState, NodeSelection, Transaction } from 'prosemirror-state';
import React from 'react';
import { Icon, Menu } from 'semantic-ui-react';

import { Dispatch } from './keymap';
import { MenuButton } from './MenuButton';

const useStyles = makeStyles(({ palette }) =>
  createStyles({
    menuBar: {
      paddingLeft: 0,
      paddingRight: 0,
      backgroundColor: palette.common.white,
      borderBottom: `1px solid ${palette.divider}`
    }
  })
);

const markActive = (type: MarkType) => (state: EditorState): boolean => {
  const { from, $from, to, empty } = state.selection;

  return empty ? !!type.isInSet(state.storedMarks || $from.marks()) : state.doc.rangeHasMark(from, to, type);
};

const blockActive = (type: NodeType, attrs = {}) => (state: EditorState) => {
  const { $from, to } = state.selection;

  if (state.selection instanceof NodeSelection && state.selection.node) {
    return state.selection.node.hasMarkup(type, attrs);
  }

  return to <= $from.end() && $from.parent.hasMarkup(type, attrs);
};

const promptForURL = () => {
  let url = window && window.prompt('Enter the URL', 'https://');

  if (url && !/^https?:\/\//i.test(url)) {
    url = 'http://' + url;
  }

  return url;
};

export interface MenuItem {
  title: string;
  content: React.ReactNode;
  /**
   * A predicate function to determine whether the item is 'active' (for
   * example, the item for toggling the strong mark might be active then
   * the cursor is in strong text).
   * @param state
   */
  active?: (state: EditorState) => boolean;
  /**
   * Function that is used to determine if the item is enabled. If
   * given and returning false, the item will be given a disabled
   * styling.
   * @param state
   * @param dispatch
   */
  enable?: (state: EditorState, dispatch?: Dispatch) => boolean;
  /**
   * The function to execute when the menu item is activated.
   * @param state
   * @param dispatch
   */
  run: (state: EditorState, dispatch: Dispatch) => boolean;
}

export type MenuGroup = { [key: string]: MenuItem };
export type MenuConfig = { [key: string]: MenuGroup };

const menu: MenuConfig = {
  marks: {
    strong: {
      title: 'Toggle bold',
      content: <Icon name='bold' />,
      active: markActive(schema.marks.strong),
      run: toggleMark(schema.marks.strong)
    },
    italic: {
      title: 'Toggle italic',
      content: <Icon name='italic' />,
      active: markActive(schema.marks.em),
      run: toggleMark(schema.marks.em)
    },
    link: {
      title: 'Add or remove link',
      content: <Icon name='linkify' />,
      active: markActive(schema.marks.link),
      enable: (state: EditorState) => !state.selection.empty,
      run: (state: EditorState, dispatch: any) => {
        if (markActive(schema.marks.link)(state)) {
          toggleMark(schema.marks.link)(state, dispatch);
          return true;
        }

        const href = promptForURL();
        if (!href) {
          return false;
        }

        return toggleMark(schema.marks.link, { href })(state, dispatch);
      }
    }
  },
  blocks: {
    plain: {
      title: 'Change to paragraph',
      content: <Icon name='paragraph' />,
      active: blockActive(schema.nodes.paragraph),
      enable: setBlockType(schema.nodes.paragraph),
      run: setBlockType(schema.nodes.paragraph)
    },
    h1: {
      title: 'Change to heading 1',
      content: <Icon name='heading' />,
      active: blockActive(schema.nodes.heading, { level: 1 }),
      enable: setBlockType(schema.nodes.heading, { level: 1 }),
      run: setBlockType(schema.nodes.heading, { level: 1 })
    },
    bullet_list: {
      title: 'Wrap in bullet list',
      content: <Icon name='list ul' />,
      active: blockActive(schema.nodes.bullet_list),
      enable: wrapInList(schema.nodes.bullet_list),
      run: wrapInList(schema.nodes.bullet_list)
    },
    ordered_list: {
      title: 'Wrap in ordered list',
      content: <Icon name='list ol' />,
      active: blockActive(schema.nodes.ordered_list),
      enable: wrapInList(schema.nodes.ordered_list),
      run: wrapInList(schema.nodes.ordered_list)
    }
  },
  history: {
    undo: {
      title: 'Undo last change',
      content: <Icon name='undo' />,
      enable: undo,
      run: undo
    },
    redo: {
      title: 'Redo last undone change',
      content: <Icon name='redo' />,
      enable: redo,
      run: redo
    }
  }
};

interface MenuBarProps {
  state: EditorState;
  dispatch: (tr: Transaction) => void;
}

export const MenuBar: React.FC<MenuBarProps> = ({ children, state, dispatch }) => {
  const classes = useStyles();
  return (
    <Menu className={clsx(classes.menuBar)}>
      {Object.entries(menu).map(([key, group]) => (
        <div key={key}>
          {Object.entries(group).map(([key, button]) => (
            <MenuButton key={key} item={button} dispatch={dispatch} state={state} />
          ))}
        </div>
      ))}
      {children}
    </Menu>
  );
};
