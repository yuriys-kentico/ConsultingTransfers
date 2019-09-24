import 'draft-js/dist/Draft.css';
import 'draftail/dist/draftail.css';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

import { ContentState, convertFromRaw, convertToRaw, EditorState } from 'draft-js';
import { draftToMarkdown, markdownToDraft } from 'markdown-draft-js';
import React, { FC, useContext, useEffect, useRef, useState } from 'react';
import { Editor as WysiwygEditor } from 'react-draft-wysiwyg';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { experience, terms } from '../../../../appSettings.json';
import { getFieldBlobs, getSafePathSegment } from '../../../../connectors/AzureStorage';
import { IFieldHolderProps } from '../FieldHolder';
import { TransferContext } from '../TransferContext';

export const WriteText: FC<IFieldHolderProps> = ({ completed, name, setFieldLoading, defaultText }) => {
  const { writeText } = terms.shared.transfer.fields;
  const { blobs, uploadFiles, readBlobString } = useContext(TransferContext);

  const [loaded, setLoaded] = useState(false);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  const stateStream = useRef(new Subject<ContentState>());

  useEffect(() => {
    const fieldBlobs = getFieldBlobs(blobs, name);

    const updateEditorState = (text?: string) => {
      if (text) {
        setEditorState(EditorState.createWithContent(convertFromRaw(markdownToDraft(text))));
      }
      setLoaded(true);
    };

    if (fieldBlobs.length > 0) {
      readBlobString(fieldBlobs[0]).then(blobString => {
        updateEditorState(blobString);
      });
    } else {
      updateEditorState(defaultText);
    }

    const subscription = stateStream.current.pipe(debounceTime(experience.writeTextUpdateTimeout)).subscribe({
      next: (update: ContentState) => {
        const content = draftToMarkdown(convertToRaw(update));

        const file = new File([content], `${getSafePathSegment(name)}.md`, { type: 'text/plain' });

        uploadFiles(file, name, true).then(() => setFieldLoading(false));
      }
    });

    return () => subscription.unsubscribe();
  }, [completed, name, setFieldLoading, defaultText, uploadFiles, readBlobString]);

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
