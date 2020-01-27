import 'draft-js/dist/Draft.css';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import 'megadraft/dist/css/megadraft.css';

import { ContentState, convertToRaw, EditorState } from 'draft-js';
import { draftToMarkdown, markdownToDraft } from 'markdown-draft-js';
import { editorStateFromRaw, IAction, MegadraftEditor, MegadraftIcons as icons } from 'megadraft';
import React, { FC, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { experience } from '../../../../appSettings.json';
import { useDependency } from '../../../../services/dependencyContainer';
import { ITransferFilesService } from '../../../../services/TransferFilesService';
import { transfer } from '../../../../terms.en-us.json';
import { useSubscription } from '../../../../utilities/observables';
import { MessageContext } from '../../header/MessageContext';
import { IFieldProps } from '../FieldHolder';

export const WriteText: FC<IFieldProps> = ({
  completed,
  name,
  defaultText,
  headingBlock,
  commentBlock,
  setFieldReady,
  setFieldCanBeCompleted
}) => {
  const { writeText } = transfer.fields;

  const [ready, setReady] = useState(false);
  const [editorState, setEditorState] = useState(editorStateFromRaw(null));

  const stateStream = useRef(new Subject<ContentState>());

  const transferFilesService = useDependency(ITransferFilesService);
  transferFilesService.messageContext = useContext(MessageContext);

  const files = useSubscription(transferFilesService.files);

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (files && !loaded) {
      const fieldFiles = transferFilesService.getFieldFiles(files, name);

      const updateEditorState = (text?: string) => {
        text && setEditorState(editorStateFromRaw(markdownToDraft(text)));
        setReady(true);

        if (text !== '') {
          setFieldCanBeCompleted(true);
        }
      };

      if (fieldFiles.length > 0) {
        transferFilesService.readFileAsText(fieldFiles[0]).then(blobString => {
          updateEditorState(blobString);
        });
      } else {
        updateEditorState(defaultText);
      }

      setLoaded(true);
    }
  }, [defaultText, files, name, transferFilesService, loaded, setFieldCanBeCompleted]);

  useEffect(() => {
    const subscription = stateStream.current.pipe(debounceTime(experience.writeTextUpdateTimeout)).subscribe({
      next: async (contentState: ContentState) => {
        const content = draftToMarkdown(convertToRaw(contentState));

        if (content !== '') {
          setFieldReady(false);

          const file = transferFilesService.getFile(content, name, 'md', 'text/plain');

          await transferFilesService.uploadFiles(file, name, true);

          setFieldReady(true);
          setFieldCanBeCompleted(true);
        } else {
          setFieldCanBeCompleted(false);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [name, transferFilesService, setFieldReady, setFieldCanBeCompleted]);

  const updateEditorState = useCallback(
    (editorState: EditorState) => {
      if (!completed) {
        setEditorState(editorState);

        stateStream.current.next(editorState.getCurrentContent());
      }
    },
    [completed]
  );

  const actions: IAction[] = [
    { type: 'inline', label: 'B', style: 'BOLD', icon: icons.BoldIcon },
    { type: 'inline', label: 'I', style: 'ITALIC', icon: icons.ItalicIcon },
    {
      type: 'entity',
      label: 'Link',
      style: 'link',
      entity: 'LINK',
      icon: icons.LinkIcon
    },
    { type: 'separator' },
    {
      type: 'block',
      label: 'UL',
      style: 'unordered-list-item',
      icon: icons.ULIcon
    },
    {
      type: 'block',
      label: 'OL',
      style: 'ordered-list-item',
      icon: icons.OLIcon
    },
    {
      type: 'block',
      label: 'H2',
      style: 'header-two',
      icon: () => (
        <svg width='24' height='24' viewBox='0 0 24 24'>
          <path
            d='M15.6,19.1v-5.8H8.4v5.8H5.5V4.9h2.9v5.8h7.2V4.9h2.9v14.2H15.6z'
            fill='currentColor'
            fillRule='evenodd'
          />
        </svg>
      )
    },
    {
      type: 'block',
      label: 'QT',
      style: 'blockquote',
      icon: icons.BlockQuoteIcon
    }
  ];

  return (
    <div className={!completed ? 'editor' : 'editor disabled'}>
      {headingBlock()}
      {commentBlock()}
      {ready && (
        <MegadraftEditor
          placeholder={writeText.placeholder}
          readOnly={completed}
          resetStyleNewLine={true}
          editorState={editorState}
          onChange={updateEditorState}
          sidebarRendererFn={() => null}
          actions={actions}
        />
      )}
    </div>
  );
};
