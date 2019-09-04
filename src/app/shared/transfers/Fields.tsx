import { FC, useContext } from 'react';
import React from 'react';
import { List } from 'semantic-ui-react';

import { UploadFile } from './fields/UploadFile';
import { WriteParagraph } from './fields/WriteParagraph';
import { TransferContext } from './TransferContext';

type FieldType = 'upload_file' | 'write_paragraph';

export interface IFieldProps {
  name: string;
  comment: string;
  type: FieldType;
}

export const Fields: FC = () => {
  const transferContext = useContext(TransferContext);

  let fields: IFieldProps[] = [];

  const strippedJson = transferContext.request.fields
    .resolveHtml()
    .replace(/<.*?>/g, '')
    .replace(/\n/g, '')
    .replace(/}{/g, '},{');

  const maybeJson = `[${strippedJson}]`;

  try {
    fields = JSON.parse(maybeJson);
  } catch (error) {
    console.log(maybeJson, error);
  }

  const getFieldType = (fieldType: FieldType) => {
    switch (fieldType) {
      case 'write_paragraph':
        return WriteParagraph;
      case 'upload_file':
        return UploadFile;
    }
  };

  return (
    <List relaxed>
      {fields.map((element, index: number) => (
        <List.Item as={getFieldType(element.type)} key={index} {...element}/>
      ))}
    </List>
  );
};
