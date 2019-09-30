import 'draft-js/dist/Draft.css';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

import { ContentState, convertFromRaw, convertToRaw, EditorState } from 'draft-js';
import { draftToMarkdown, markdownToDraft } from 'markdown-draft-js';
import React, { FC, useContext, useEffect, useRef, useState } from 'react';
import { Editor as WysiwygEditor } from 'react-draft-wysiwyg';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { experience } from '../../../../appSettings.json';
import { getFieldBlobs, getSafePathSegment } from '../../../../services/azureStorage/azureStorage';
import { IAzureStorageService } from '../../../../services/azureStorage/AzureStorageService';
import { useDependency } from '../../../../services/dependencyContainer';
import { transfer } from '../../../../terms.en-us.json';
import { useSubscription } from '../../../../utilities/observables';
import { MessageContext } from '../../header/MessageContext';
import { IFieldHolderProps } from '../FieldHolder';

export const WriteText: FC<IFieldHolderProps> = ({ completed, name, setFieldLoading, defaultText }) => {
  const { writeText } = transfer.fields;

  const [loaded, setLoaded] = useState(false);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  const stateStream = useRef(new Subject<ContentState>());

  const azureStorageService = useDependency(IAzureStorageService);
  azureStorageService.messageContext = useContext(MessageContext);

  const blobs = useSubscription(azureStorageService.blobs);

  useEffect(() => {
    const fieldBlobs = blobs && getFieldBlobs(blobs, name);

    const updateEditorState = (text?: string) => {
      text && setEditorState(EditorState.createWithContent(convertFromRaw(markdownToDraft(text))));
      setLoaded(true);
    };

    if (fieldBlobs && fieldBlobs.length > 0) {
      azureStorageService.readBlobString(fieldBlobs[0]).then(blobString => {
        updateEditorState(blobString);
      });
    } else {
      updateEditorState(defaultText);
    }

    const subscription = stateStream.current.pipe(debounceTime(experience.writeTextUpdateTimeout)).subscribe({
      next: (update: ContentState) => {
        const content = draftToMarkdown(convertToRaw(update));

        const file = new File([content], `${getSafePathSegment(name)}.md`, { type: 'text/plain' });

        azureStorageService.uploadFiles(file, name, true).then(() => setFieldLoading(false));
      }
    });

    return () => subscription.unsubscribe();
  }, [completed, name, setFieldLoading, defaultText, azureStorageService, blobs]);

  const updateEditorState = (draftState: EditorState) => {
    setEditorState(draftState);
    setFieldLoading(true);

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
      {!loaded ? null : (
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
