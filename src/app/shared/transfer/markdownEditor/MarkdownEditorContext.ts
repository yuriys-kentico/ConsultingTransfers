import { EditorState } from 'prosemirror-state';
import { createContext } from 'react';

export interface IMarkdownEditorContext {
  editorState: EditorState;
  disabled: boolean;
}

export const MarkdownEditorContext = createContext<IMarkdownEditorContext>({} as any);
