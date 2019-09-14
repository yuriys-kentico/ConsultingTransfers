import { setBlockType, toggleMark } from 'prosemirror-commands';
import { redo, undo } from 'prosemirror-history';
import { schema } from 'prosemirror-markdown';
import { MarkType, NodeType } from 'prosemirror-model';
import { wrapInList } from 'prosemirror-schema-list';
import { EditorState, NodeSelection, Transaction } from 'prosemirror-state';
import React, { useContext } from 'react';
import { Button, Icon } from 'semantic-ui-react';

import { Dispatch } from './keymap';
import { MarkdownEditorButton } from './MarkdownEditorButton';
import { MarkdownEditorContext } from './MarkdownEditorContext';

export type MenuConfig = { [key: string]: MenuGroup };

export type MenuGroup = { [key: string]: IMenuItem };

export interface IMenuItem {
  title: string;
  icon: React.ReactNode;
  active?: (state: EditorState) => boolean;
  enabled?: (state: EditorState, dispatch?: Dispatch) => boolean;
  onClick: (state: EditorState, dispatch: Dispatch) => boolean;
}

const markActive = (type: MarkType) => (state: EditorState): boolean => {
  const {
    doc,
    storedMarks,
    selection: { from, $from, to, empty }
  } = state;

  return empty ? !!type.isInSet(storedMarks || $from.marks()) : doc.rangeHasMark(from, to, type);
};

const blockActive = (type: NodeType, attrs = {}) => (state: EditorState) => {
  const { $from, to } = state.selection;

  if (state.selection instanceof NodeSelection && state.selection.node) {
    return state.selection.node.hasMarkup(type, attrs);
  }

  return to <= $from.end() && $from.parent.hasMarkup(type, attrs);
};

const promptForUrl = () => {
  let url = window.prompt('Enter a URL', 'https://');

  if (url && !/^https?:\/\//i.test(url)) {
    url = 'http://' + url;
  }

  return url;
};

const menu: MenuConfig = {
  marks: {
    strong: {
      title: 'Toggle bold',
      icon: <Icon name='bold' />,
      active: markActive(schema.marks.strong),
      onClick: toggleMark(schema.marks.strong)
    },
    italic: {
      title: 'Toggle italic',
      icon: <Icon name='italic' />,
      active: markActive(schema.marks.em),
      onClick: toggleMark(schema.marks.em)
    },
    link: {
      title: 'Add or remove link',
      icon: <Icon name='linkify' />,
      active: markActive(schema.marks.link),
      enabled: (state: EditorState) => !state.selection.empty,
      onClick: (state: EditorState, dispatch: any) => {
        if (markActive(schema.marks.link)(state)) {
          toggleMark(schema.marks.link)(state, dispatch);
          return true;
        }

        const href = promptForUrl();

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
      icon: <Icon name='paragraph' />,
      active: blockActive(schema.nodes.paragraph),
      enabled: setBlockType(schema.nodes.paragraph),
      onClick: setBlockType(schema.nodes.paragraph)
    },
    h1: {
      title: 'Change to heading',
      icon: <Icon name='heading' />,
      active: blockActive(schema.nodes.heading, { level: 1 }),
      enabled: setBlockType(schema.nodes.heading, { level: 1 }),
      onClick: setBlockType(schema.nodes.heading, { level: 1 })
    },
    bullet_list: {
      title: 'Change to bullet list',
      icon: <Icon name='list ul' />,
      active: blockActive(schema.nodes.bullet_list),
      enabled: wrapInList(schema.nodes.bullet_list),
      onClick: wrapInList(schema.nodes.bullet_list)
    },
    ordered_list: {
      title: 'Change to numbered list',
      icon: <Icon name='list ol' />,
      active: blockActive(schema.nodes.ordered_list),
      enabled: wrapInList(schema.nodes.ordered_list),
      onClick: wrapInList(schema.nodes.ordered_list)
    }
  },
  history: {
    undo: {
      title: 'Undo',
      icon: <Icon name='undo' />,
      enabled: undo,
      onClick: undo
    },
    redo: {
      title: 'Redo',
      icon: <Icon name='redo' />,
      enabled: redo,
      onClick: redo
    }
  }
};

interface MenuBarProps {
  dispatch: (tr: Transaction) => void;
}

export const MarkdownEditorHeader: React.FC<MenuBarProps> = ({ children, dispatch }) => {
  const { disabled } = useContext(MarkdownEditorContext);

  return disabled ? null : (
    <div>
      {Object.entries(menu).map(([key, group]) => (
        <Button.Group key={key}>
          {Object.entries(group).map(([key, button]) => (
            <MarkdownEditorButton key={key} button={button} dispatch={dispatch} />
          ))}
        </Button.Group>
      ))}
      {children}
    </div>
  );
};
