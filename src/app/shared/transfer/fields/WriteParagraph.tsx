import React, { FC, useContext, useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Form } from 'semantic-ui-react';

import { useContainer } from '../../../../connectors/azure/azureStorage';
import { IFieldProps } from '../Fields';
import { MarkdownEditor } from '../markdownEditor/MarkdownEditor';
import { TransferContext } from '../TransferContext';

const debounceSubject = new Subject<string>();

export const WriteText: FC<IFieldProps> = ({ name, comment }) => {
  const { request, blobs, uploadFiles, readBlobString } = useContext(TransferContext);
  const { containerURL } = useContainer(request.system.codename);
  const [text, setText] = useState<string>();

  useEffect(() => {
    const fieldBlob = blobs.filter(blob => blob.name.startsWith(`${name}/`))[0];

    readBlobString(fieldBlob, containerURL).then(blobString => {
      if (blobString !== undefined) {
        setText(blobString);
      }
    });

    const subscription = debounceSubject.pipe(debounceTime(2000)).subscribe({
      next: update => {
        const file = new File([update], `${name}.md`, { type: 'text/plain' });

        uploadFiles(file, name, containerURL);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateStorage = (value: string) => {
    debounceSubject.next(value);
  };

  return <Form>{!text ? null : <MarkdownEditor markdown={text} onChange={updateStorage} />}</Form>;
};
