import { EditorState } from 'prosemirror-state';
import { createContext } from 'react';

export interface IMarkdownEditorContext {
  editorState: EditorState;
}

export const MarkdownEditorContext = createContext<IMarkdownEditorContext>({} as any);
