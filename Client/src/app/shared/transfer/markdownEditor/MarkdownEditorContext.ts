import { EditorState, Transaction } from 'prosemirror-state';
import { createContext } from 'react';

export interface IMarkdownEditorContext {
  editorState: EditorState;
  dispatchTransaction: (transaction: Transaction<any>) => void;
  disabled: boolean;
}

export const MarkdownEditorContext = createContext<IMarkdownEditorContext>({} as any);
