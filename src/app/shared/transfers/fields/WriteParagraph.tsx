import { fromMarkdown } from '@whitewater-guide/md-editor';
import { defaultMarkdownSerializer } from 'prosemirror-markdown';
import { EditorState } from 'prosemirror-state';
import React, { FC, useContext, useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Form, Header, List, Segment } from 'semantic-ui-react';

import { useContainer } from '../../../../connectors/azure/azureStorage';
import { IFieldProps } from '../Fields';
import { MarkdownEditor } from '../markdownEditor/MarkdownEditor';
import { TransferContext } from '../TransferContext';

const debounceSubject = new Subject<string>();

export const WriteParagraph: FC<IFieldProps> = ({ name, comment }) => {
  const { request, blobs, uploadFiles, readBlobString } = useContext(TransferContext);
  const { containerURL } = useContainer(request.system.codename);
  const [editorState, setEditorState] = useState<EditorState | null>(null);

  useEffect(() => {
    const fieldBlob = blobs.filter(blob => blob.name.startsWith(`${name}/`))[0];

    readBlobString(fieldBlob, containerURL).then(blobString => {
      if (blobString) {
        setEditorState(fromMarkdown(blobString).prosemirror);
      }
    });

    const subscription = debounceSubject.pipe(debounceTime(2000)).subscribe({
      next: update => {
        const file = new File([update], `${name}.txt`, { type: 'text/plain' });

        uploadFiles(file, name, containerURL);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateStorage = (value: string) => {
    debounceSubject.next(value);
  };

  return (
    <List.Item>
      <Segment as={Form}>
        <Header as='h4' content={`${name}`} />
        {comment}
        {!editorState ? null : (
          <MarkdownEditor
            editorState={editorState}
            onChange={editorState => updateStorage(defaultMarkdownSerializer.serialize(editorState.doc))}
          />
        )}
      </Segment>
    </List.Item>
  );
};
