import { FC, useContext, useState } from 'react';
import React from 'react';
import { Checkbox, Divider, Header, Segment } from 'semantic-ui-react';

import { useContainer } from '../../../connectors/azure/azureStorage';
import { Field } from '../../../connectors/kenticoCloud/contentTypes/Field';
import { AppContext } from '../../AppContext';
import { AppHeaderContext } from '../header/AppHeaderContext';
import { UploadFile } from './fields/UploadFile';
import { WriteText } from './fields/WriteText';
import { TransferContext } from './TransferContext';

export type FieldType = 'upload_file' | 'write_text';

export interface IFieldHolderProps {
  field: Field;
  type: FieldType;
  completed: boolean;
}

export const FieldHolder: FC<IFieldHolderProps> = props => {
  const name = props.field.name.value;

  const { terms } = useContext(AppContext);
  const { showInfo } = useContext(AppHeaderContext);
  const { uploadFiles, request, blobs } = useContext(TransferContext);
  const { containerURL } = useContainer(request.system.codename);
  const [loading, setLoading] = useState(false);

  const completed = blobs.filter(blob => blob.name === `${name}/completed`).length > 0;

  const getFieldType = (fieldType: FieldType) => {
    switch (fieldType) {
      case 'write_text':
        return WriteText;
      case 'upload_file':
        return UploadFile;
    }
  };

  const updateCompleted = async () => {
    const file = new File([], `completed`);

    setLoading(true);

    await uploadFiles(file, name, containerURL);

    setLoading(false);
    showInfo(terms.shared.transfer.fields.markedCompleted);
  };

  return (
    <Segment loading={loading} disabled={completed}>
      <Header floated='right'>
        <Checkbox
          toggle
          label={terms.shared.transfer.fields.markCompleted}
          checked={completed}
          disabled={completed}
          onChange={updateCompleted}
        />
      </Header>
      <Header as='h3' content={props.field.name.value} />
      <Divider fitted hidden />
      {props.field.comment.value}
      <Divider fitted hidden />
      <Segment as={getFieldType(props.type)} {...props} completed={completed} />
    </Segment>
  );
};
