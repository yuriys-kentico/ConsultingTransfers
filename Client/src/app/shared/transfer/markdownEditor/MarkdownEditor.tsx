import { history } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { defaultMarkdownParser, defaultMarkdownSerializer, schema } from 'prosemirror-markdown';
import { EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import React, { FC, useContext, useEffect, useRef, useState } from 'react';
import ProseMirrorDocument, { typeMap } from 'react-prosemirror-document';

import { AppContext } from '../../../AppContext';
import { keys } from './keymap';
import { IMarkdownEditorContext, MarkdownEditorContext } from './MarkdownEditorContext';
import { MarkdownEditorHeader } from './MarkdownEditorHeader';
import { placeholder } from './placeholder';

interface IMarkdownEditorProps {
  markdown: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

const proseMirrorDocumentTypeMap = {
  ...typeMap,
  heading: 'h1',
  bullet_list: 'ul',
  ordered_list: 'ol',
  list_item: 'li'
};

export const MarkdownEditor: FC<IMarkdownEditorProps> = ({ markdown, onChange, disabled }) => {
  const { writeParagraph } = useContext(AppContext).terms.shared.transfer.fields;
  const editorRef = useRef<HTMLDivElement>(null);
  const editorView = useRef<EditorView | null>(null);

  const prosemirrorDocument = defaultMarkdownParser.parse(markdown);

  const editorState = useRef(
    EditorState.create({
      schema,
      plugins: [keymap(keys), history(), placeholder()],
      doc: prosemirrorDocument
    })
  );

  const dispatchTransaction = useRef((transaction: Transaction<any>) => {
    if (editorView.current) {
      const updatedEditorState = editorView.current.state.apply(transaction);

      editorView.current.updateState(updatedEditorState);
      setMarkdownEditorContext(markdownEditorContext => ({
        ...markdownEditorContext,
        editorState: updatedEditorState
      }));

      onChange(defaultMarkdownSerializer.serialize(updatedEditorState.doc));
    }
  });

  useEffect(() => {
    if (editorRef.current) {
      editorView.current = new EditorView(editorRef.current, {
        state: editorState.current,
        dispatchTransaction: dispatchTransaction.current,
        attributes: {
          class: disabled ? 'prose mirror view disabled' : 'prose mirror view'
        }
      });
    }
  }, [disabled]);

  const [markdownEditorContext, setMarkdownEditorContext] = useState<IMarkdownEditorContext>({
    editorState: editorState.current,
    dispatchTransaction: dispatchTransaction.current,
    disabled
  });

  return (
    <MarkdownEditorContext.Provider value={markdownEditorContext}>
      <style>{`.prose.mirror .placeholder::before {content: "${writeParagraph.placeholder}"}`}</style>
      <MarkdownEditorHeader />
      {disabled ? (
        <ProseMirrorDocument document={prosemirrorDocument.toJSON()} typeMap={proseMirrorDocumentTypeMap} />
      ) : (
        <div ref={editorRef} spellCheck />
      )}
    </MarkdownEditorContext.Provider>
  );
};
