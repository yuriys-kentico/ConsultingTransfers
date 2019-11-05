import { FC, lazy, useContext, useState } from 'react';
import React from 'react';
import { Checkbox, CheckboxProps, Divider, Header, Loader, Segment } from 'semantic-ui-react';

import { IAzureFunctionsService } from '../../../services/azureFunctions/AzureFunctionsService';
import { completed, getSafePathSegment } from '../../../services/azureStorage/azureStorage';
import { IAzureStorageService } from '../../../services/azureStorage/AzureStorageService';
import { useDependency } from '../../../services/dependencyContainer';
import { transfer as transferTerms } from '../../../terms.en-us.json';
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

  const { showInfo, showSuccess } = useContext(MessageContext);
  const [loading, setLoading] = useState(false);
  const [fieldLoading, setFieldLoading] = useState(false);

  const azureFunctionService = useDependency(IAzureFunctionsService);
  const transfer = useSubscription(azureFunctionService.transfer);

  const azureStorageService = useDependency(IAzureStorageService);
  azureStorageService.messageContext = useContext(MessageContext);
  const blobs = useSubscription(azureStorageService.blobs);

  const isCompleted =
    blobs && blobs.filter(blob => blob.name === `${getSafePathSegment(name)}/${completed}`).length > 0;

  const getFieldComponent = (fieldType: FieldType) => {
    switch (fieldType) {
      case 'write_text':
        return WriteText;
      case 'upload_file':
        return UploadFile;
      case 'download_asset':
        return DownloadAsset;
    }
  };

  const updateCompleted = async (data: CheckboxProps) => {
    if (data.checked) {
      showInfo(transferTerms.fields.markingCompleted);

      setLoading(true);

      await azureStorageService.uploadFiles(new File([], completed), name, true);

      if (transfer) {
        await azureFunctionService.sendTeamsMessage({
          transferToken: transfer.transferToken,
          fieldName: name,
          messageItemCodename: 'field_updated'
        });
      }

      setLoading(false);

      showSuccess(transferTerms.fields.markedCompleted);
    } else if (window.confirm(transferTerms.fields.confirmMarkIncomplete)) {
      showInfo(transferTerms.fields.markingIncomplete);

      setLoading(true);

      blobs &&
        (await azureStorageService.deleteBlobs(
          blobs.filter(blob => blob.name === `${getSafePathSegment(name)}/${completed}`),
          true
        ));

      setLoading(false);

      showSuccess(transferTerms.fields.markedIncomplete);
    }
  };

  return (
    <Segment loading={loading} disabled={isCompleted} className='inherit color'>
      <Header floated='right'>
        <Checkbox
          toggle
          label={isCompleted ? transferTerms.fields.markIncomplete : transferTerms.fields.markCompleted}
          checked={isCompleted}
          onChange={(_, data) => updateCompleted(data)}
        />
      </Header>
      <Header floated='right' content={<Loader active={fieldLoading} inline size='tiny' />} />
      <Header as='h3' content={name} />
      <Divider fitted hidden />
      {comment}
      <Divider fitted hidden />
      <Divider fitted hidden />
      <Segment as={getFieldComponent(type)} {...props} completed={isCompleted} setFieldLoading={setFieldLoading} />
    </Segment>
  );
};
