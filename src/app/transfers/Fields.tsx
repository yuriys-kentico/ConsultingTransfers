import { FC, useContext } from 'react';
import React from 'react';
import { Field, FieldType } from './kenticoCloud/Field';
import { UploadFile } from './fields/UploadFile';
import { List } from 'semantic-ui-react';
import { TransferContext } from './TransferContext';

export interface IFieldProps {
  field: Field;
}

export const Fields: FC = () => {
  const transferContext = useContext(TransferContext);

  const getFieldType = (field: Field) => {
    switch (field.type.value[0].codename as FieldType) {
      case 'upload_file':
        return UploadFile;
    }
  };

  return (
    <List relaxed>
      {transferContext.item.fields.value.map((element, index: number) => (
        <List.Item as={getFieldType(element)} key={index} field={element} />
      ))}
    </List>
  );
};
