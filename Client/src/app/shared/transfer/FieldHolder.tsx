import { FC, lazy, Suspense, useContext, useState } from 'react';
import React from 'react';
import { Checkbox, Divider, Header, Loader, Segment } from 'semantic-ui-react';

import { AzureStorage } from '../../../connectors/azure/azureStorage';
import { FieldType, IField } from '../../../connectors/azureFunctions/Field';
import { AppContext } from '../../AppContext';
import { AppHeaderContext } from '../header/AppHeaderContext';
import { TransferContext } from './TransferContext';

const WriteText = lazy(() => import('./fields/WriteText').then(module => ({ default: module.WriteText })));
const UploadFile = lazy(() => import('./fields/UploadFile').then(module => ({ default: module.UploadFile })));


export interface IFieldHolderProps {
  field: IField;
  type: FieldType;
  completed: boolean;
  setFieldLoading: (loading: boolean) => void;
}

export const FieldHolder: FC<IFieldHolderProps> = props => {
  const name = props.field.name;

  const { terms } = useContext(AppContext);
  const { showInfo } = useContext(AppHeaderContext);
  const { containerURL, uploadFiles, blobs } = useContext(TransferContext);
  const [loading, setLoading] = useState(false);
  const [fieldLoading, setFieldLoading] = useState(false);

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
    const file = new File([], AzureStorage.completed);

    setLoading(true);

    await uploadFiles(file, name, containerURL, true);

    setLoading(false);
    showInfo(terms.shared.transfer.fields.markedCompleted);
  };

  return (
    <Suspense fallback={<Loader active size='massive' />}>
      <Segment loading={loading} disabled={completed} className='inherit color'>
        <Header floated='right'>
          <Checkbox
            toggle
            label={terms.shared.transfer.fields.markCompleted}
            checked={completed}
            disabled={completed}
            onChange={updateCompleted}
          />
        </Header>
        <Header floated='right' content={<Loader active={fieldLoading} inline size='tiny' />} />
        <Header as='h3' content={name} />
        <Divider fitted hidden />
        {props.field.comment}
        <Divider fitted hidden />
        <Divider fitted hidden />
        <Segment as={getFieldType(props.type)} {...props} completed={completed} setFieldLoading={setFieldLoading} />
      </Segment>
    </Suspense>
  );
};
