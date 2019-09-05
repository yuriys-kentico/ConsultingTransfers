import 'prosemirror-view/style/prosemirror.css';

import { fromMarkdown } from '@whitewater-guide/md-editor';
import { EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import React, { FC, useContext, useEffect, useRef } from 'react';

import { AppContext } from '../../../AppContext';
import classes from './MdEditor.module.css';
import { MenuBar } from './MenuBar';

export const defaultEditorState = fromMarkdown('');

interface MarkdownEditorProps {
  onChange: (value: EditorState) => void;
  editorState: EditorState;
}

export const MarkdownEditor: FC<MarkdownEditorProps> = ({ onChange, editorState }) => {
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

  useEffect(() => {
    if (editorRef.current) {
      editorView.current = new EditorView(editorRef.current, {
        state: editorState,
        dispatchTransaction: dispatchTransaction,
        attributes: {
          class: classes.ProseMirrorView
        }
      });
    }
  }, [editorRef]);

  const dispatchTransaction = (transaction: Transaction<any>) => {
    if (editorView.current) {
      const updatedEditorState = editorView.current.state.apply(transaction);

      editorView.current.updateState(updatedEditorState);

      onChange(updatedEditorState);
    }
  };

  return (
    <div className='write paragraph'>
      <MenuBar state={editorState} dispatch={dispatchTransaction}></MenuBar>
      <div ref={editorRef} className='prose mirror container' spellCheck placeholder={writeParagraph.placeholder} />
    </div>
  );
};
