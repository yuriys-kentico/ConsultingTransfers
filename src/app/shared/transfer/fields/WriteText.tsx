import React, { FC, useContext, useEffect, useRef, useState } from 'react';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Form } from 'semantic-ui-react';

import { getFieldBlobs, useContainer } from '../../../../connectors/azure/azureStorage';
import { IFieldHolderProps } from '../FieldHolder';
import { MarkdownEditor } from '../markdownEditor/MarkdownEditor';
import { TransferContext } from '../TransferContext';

export const WriteText: FC<IFieldHolderProps> = ({ field, completed, setFieldLoading }) => {
  const name = field.name.value;

  const { request, blobs, uploadFiles, readBlobString } = useContext(TransferContext);
  const { containerURL } = useContainer(request.system.codename);
  const [text, setText] = useState<string>('');
  const [loaded, setLoaded] = useState<boolean>();

  const textStream = useRef(new Subject<string>());

  useEffect(() => {
    const fieldBlobs = getFieldBlobs(blobs, name);

    if (fieldBlobs.length > 0) {
      readBlobString(fieldBlobs[0], containerURL).then(blobString => {
        if (blobString !== undefined) {
          setText(blobString);
          setLoaded(true);
        }
      });
    } else {
      setLoaded(true);
    }

    const subscription = textStream.current.pipe(debounceTime(2000)).subscribe({
      next: update => {
        const file = new File([update], `${name}.md`, { type: 'text/plain' });

        uploadFiles(file, name, containerURL, true);
        setFieldLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateStorage = (value: string) => {
    textStream.current.next(value);
    setFieldLoading(true);
  };

  return (
    <Form>{!loaded ? null : <MarkdownEditor markdown={text} onChange={updateStorage} disabled={completed} />}</Form>
  );
};
