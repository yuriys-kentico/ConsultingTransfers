import { FC, lazy, useContext, useState } from 'react';
import React from 'react';
import { Checkbox, Divider, Header, Loader, Segment } from 'semantic-ui-react';

import { terms } from '../../../appSettings.json';
import { completed, getSafePathSegment } from '../../../services/azureStorage/azureStorage';
import { IAzureStorageService } from '../../../services/azureStorage/AzureStorageService';
import { useDependency } from '../../../services/dependencyContainer';
import { useSubscription } from '../../../utilities/observables';
import { MessageContext } from '../header/MessageContext';

const WriteText = lazy(() => import('./fields/WriteText').then(module => ({ default: module.WriteText })));
const UploadFile = lazy(() => import('./fields/UploadFile').then(module => ({ default: module.UploadFile })));
const DownloadAsset = lazy(() => import('./fields/DownloadAsset').then(module => ({ default: module.DownloadAsset })));

export type FieldType = 'upload_file' | 'write_text' | 'download_asset';

export interface IFieldHolderProps {
  name: string;
  comment: string;
  type: FieldType;
  completed: boolean;
  assets?: Asset[];
  defaultText?: string;
  setFieldLoading: (loading: boolean) => void;
}

interface Asset {
  name: string;
  description: string | null;
  type: string;
  size: number;
  url: string;
}

export const FieldHolder: FC<IFieldHolderProps> = props => {
  const { name, comment, type } = props;

  const { showInfo } = useContext(MessageContext);
  const [loading, setLoading] = useState(false);
  const [fieldLoading, setFieldLoading] = useState(false);

  const azureStorageService = useDependency(IAzureStorageService);
  azureStorageService.messageHandlers = useContext(MessageContext);

  const blobs = useSubscription(azureStorageService.blobs);

  const isCompleted =
    blobs && blobs.filter(blob => blob.name === `${getSafePathSegment(name)}/${completed}`).length > 0;

  const getFieldType = (fieldType: FieldType) => {
    switch (fieldType) {
      case 'write_text':
        return WriteText;
      case 'upload_file':
        return UploadFile;
      case 'download_asset':
        return DownloadAsset;
    }
  };

  const updateCompleted = async () => {
    const file = new File([], completed);

    setLoading(true);

    await azureStorageService.uploadFiles(file, name, true);

    setLoading(false);
    showInfo(terms.shared.transfer.fields.markedCompleted);
  };

  return (
    <Segment loading={loading} disabled={isCompleted} className='inherit color'>
      <Header floated='right'>
        <Checkbox
          toggle
          label={terms.shared.transfer.fields.markCompleted}
          checked={isCompleted}
          disabled={isCompleted}
          onChange={updateCompleted}
        />
      </Header>
      <Header floated='right' content={<Loader active={fieldLoading} inline size='tiny' />} />
      <Header as='h3' content={name} />
      <Divider fitted hidden />
      {comment}
      <Divider fitted hidden />
      <Divider fitted hidden />
      <Segment as={getFieldType(type)} {...props} completed={isCompleted} setFieldLoading={setFieldLoading} />
    </Segment>
  );
};
