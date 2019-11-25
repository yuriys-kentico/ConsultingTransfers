import 'draft-js/dist/Draft.css';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

import { ContentState, convertFromRaw, convertToRaw, EditorState } from 'draft-js';
import { draftToMarkdown, markdownToDraft } from 'markdown-draft-js';
import React, { FC, useContext, useEffect, useRef, useState } from 'react';
import { Editor as WysiwygEditor } from 'react-draft-wysiwyg';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { experience } from '../../../../appSettings.json';
import { useDependency } from '../../../../services/dependencyContainer';
import { ITransferFilesService } from '../../../../services/TransferFilesService';
import { transfer } from '../../../../terms.en-us.json';
import { useSubscription } from '../../../../utilities/observables';
import { MessageContext } from '../../header/MessageContext';
import { IFieldHolderProps } from '../FieldHolder';

export const WriteText: FC<IFieldHolderProps> = ({
  completed,
  name,
  defaultText,
  setFieldReady,
  setFieldCanBeCompleted
}) => {
  const { writeText } = transfer.fields;

  const [ready, setReady] = useState(false);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  const stateStream = useRef(new Subject<ContentState>());

  const transferFilesService = useDependency(ITransferFilesService);
  transferFilesService.messageContext = useContext(MessageContext);

  const files = useSubscription(transferFilesService.files);

  useEffect(() => {
    if (files) {
      const fieldFiles = transferFilesService.getFieldFiles(files, name);

      const updateEditorState = (text?: string) => {
        text && setEditorState(EditorState.createWithContent(convertFromRaw(markdownToDraft(text))));
        setReady(true);
      };

      if (fieldFiles.length > 0) {
        transferFilesService.readFileAsText(fieldFiles[0]).then(blobString => {
          updateEditorState(blobString);
        });
      } else {
        updateEditorState(defaultText);
      }
    }

    const subscription = stateStream.current.pipe(debounceTime(experience.writeTextUpdateTimeout)).subscribe({
      next: (update: ContentState) => {
        const content = draftToMarkdown(convertToRaw(update));

        const file = transferFilesService.getFile(content, name, 'md', 'text/plain');

        transferFilesService.uploadFiles(file, name, true).then(() => setFieldReady(true));
      }
    });

    return () => subscription.unsubscribe();
  }, [name, defaultText, transferFilesService, setFieldReady, files]);

  const updateEditorState = (draftState: EditorState) => {
    setEditorState(draftState);
    setFieldCanBeCompleted(true);
    setFieldReady(false);

    stateStream.current.next(draftState.getCurrentContent());
  };

  const toolbar = {
    options: ['blockType', 'inline', 'link', 'list', 'history'],
    blockType: {
      inDropdown: false,
      options: ['Normal', 'H3']
    },
    inline: {
      options: ['bold', 'italic', 'monospace']
    },
    link: {
      options: ['link']
    }
  };

  const localization = {
    locale: 'en',
    translations: {
      'components.controls.blocktype.normal': <b>P</b>,
      'components.controls.blocktype.h3': <b>H</b>
    }
  };

  return (
    <>
      {ready && (
        <WysiwygEditor
          editorState={editorState}
          onEditorStateChange={updateEditorState}
          toolbar={!completed ? toolbar : { options: [] }}
          localization={localization}
          wrapperClassName='editor'
          editorClassName={!completed ? 'view' : 'view disabled'}
          toolbarClassName='toolbar'
          placeholder={writeText.placeholder}
          readOnly={completed}
        />
      )}
    </>
  );
};
