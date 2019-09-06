import { history } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { defaultMarkdownParser, defaultMarkdownSerializer, schema } from 'prosemirror-markdown';
import { EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import React, { FC, useContext, useEffect, useRef, useState } from 'react';
import ProseMirrorDocument from 'react-prosemirror-document';

import { AppContext } from '../../../AppContext';
import { keys } from './keymap';
import { IMarkdownEditorContext, MarkdownEditorContext } from './MarkdownEditorContext';
import { MarkdownEditorHeader } from './MarkdownEditorHeader';
import { placeholder } from './placeholder';

interface MarkdownEditorProps {
  markdown: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

export const MarkdownEditor: FC<MarkdownEditorProps> = ({ markdown, onChange, disabled }) => {
  const {
    terms: {
      shared: {
        transfer: {
          fields: { writeParagraph }
        }
      }
    }
  } = useContext(AppContext);
  const editorRef = useRef<HTMLDivElement>(null);
  const editorView = useRef<EditorView | null>(null);

  const prosemirrorDocument = defaultMarkdownParser.parse(markdown);

  const editorState = EditorState.create({
    schema,
    plugins: [keymap(keys), history(), placeholder()],
    doc: prosemirrorDocument
  });

  useEffect(() => {
    if (editorRef.current) {
      editorView.current = new EditorView(editorRef.current, {
        state: editorState,
        dispatchTransaction,
        attributes: {
          class: disabled ? 'prose mirror view disabled' : 'prose mirror view'
        }
      });
    }
  }, [editorRef, disabled]);

  const dispatchTransaction = (transaction: Transaction<any>) => {
    if (editorView.current) {
      const updatedEditorState = editorView.current.state.apply(transaction);

      editorView.current.updateState(updatedEditorState);
      setMarkdownEditorContext(markdownEditorContext => ({
        ...markdownEditorContext,
        editorState: updatedEditorState
      }));

      onChange(defaultMarkdownSerializer.serialize(updatedEditorState.doc));
    }
  };

  const [markdownEditorContext, setMarkdownEditorContext] = useState<IMarkdownEditorContext>({
    editorState,
    disabled
  });

  return (
    <MarkdownEditorContext.Provider value={markdownEditorContext}>
      <style>{`.prose.mirror .placeholder::before {content: "${writeParagraph.placeholder}"}`}</style>
      <MarkdownEditorHeader dispatch={dispatchTransaction} />
      {disabled ? <ProseMirrorDocument document={prosemirrorDocument.toJSON()} /> : <div ref={editorRef} spellCheck />}
    </MarkdownEditorContext.Provider>
  );
};
