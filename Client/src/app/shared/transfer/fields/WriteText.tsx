import React, { FC, useContext, useEffect, useRef, useState } from 'react';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Form } from 'semantic-ui-react';

import { getFieldBlobs, getSafePathSegment } from '../../../../connectors/azure/azureStorage';
import { AppContext } from '../../../AppContext';
import { IFieldHolderProps } from '../FieldHolder';
import { MarkdownEditor } from '../markdownEditor/MarkdownEditor';
import { TransferContext } from '../TransferContext';

export const WriteText: FC<IFieldHolderProps> = ({ name, completed, setFieldLoading, defaultText }) => {
  const { experience } = useContext(AppContext);
  const { containerURL, blobs, uploadFiles, readBlobString } = useContext(TransferContext);
  const [text, setText] = useState<string>('');
  const [loaded, setLoaded] = useState<boolean>();

  const textStream = useRef(new Subject<string>());

  useEffect(() => {
    const fieldBlobs = getFieldBlobs(blobs, name);

    if (fieldBlobs.length > 0) {
      readBlobString(fieldBlobs[0], containerURL).then(blobString => {
        if (blobString !== undefined) {
          setText(blobString);
        }
        setLoaded(true);
      });
    } else {
      if (defaultText) {
        setText(defaultText);
      }
      setLoaded(true);
    }

    const subscription = textStream.current.pipe(debounceTime(experience.writeTextUpdateTimeout)).subscribe({
      next: update => {
        const file = new File([update], `${getSafePathSegment(name)}.md`, { type: 'text/plain' });

        uploadFiles(file, name, containerURL, true);
        setFieldLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [
    name,
    containerURL,
    readBlobString,
    blobs,
    setFieldLoading,
    uploadFiles,
    experience.writeTextUpdateTimeout,
    defaultText
  ]);

  const updateStorage = (value: string) => {
    textStream.current.next(value);
    setFieldLoading(true);
  };

  return (
    <Form>{!loaded ? null : <MarkdownEditor markdown={text} onChange={updateStorage} disabled={completed} />}</Form>
  );
};
