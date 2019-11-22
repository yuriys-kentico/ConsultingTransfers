import React, { FC, lazy, useContext, useState } from 'react';
import { Checkbox, CheckboxProps, Divider, Header, Loader, Segment } from 'semantic-ui-react';

import { useDependency } from '../../../services/dependencyContainer';
import { FieldType, IField } from '../../../services/models/IField';
import { ITransfersService } from '../../../services/TransfersService';
import { transfer as transferTerms } from '../../../terms.en-us.json';
import { useSubscription } from '../../../utilities/observables';
import { MessageContext } from '../header/MessageContext';

const WriteText = lazy(() => import('./fields/WriteText').then(module => ({ default: module.WriteText })));
const UploadFile = lazy(() => import('./fields/UploadFile').then(module => ({ default: module.UploadFile })));
const DownloadAsset = lazy(() => import('./fields/DownloadAsset').then(module => ({ default: module.DownloadAsset })));

export interface IFieldHolderProps extends IField {
  setFieldReady: (ready: boolean) => void;
}

export const FieldHolder: FC<IField> = props => {
  const { name, codename, comment, completed, type } = props;

  const { showInfo, showSuccess } = useContext(MessageContext);
  const [ready, setReady] = useState(true);
  const [fieldReady, setFieldReady] = useState(true);

  const transfersService = useDependency(ITransfersService);
  const transfer = useSubscription(transfersService.transfer);

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
    if (transfer && data.checked) {
      const { transferToken } = transfer;

      showInfo(transferTerms.fields.markingCompleted);

      setReady(false);

      await transfersService.updateTransfer({
        transferToken,
        field: codename,
        type: 'fieldComplete',
        messageItemCodename: 'field_updated'
      });

      await transfersService.getTransfer({ transferToken });

      setReady(true);

      showSuccess(transferTerms.fields.markedCompleted);
    } else if (transfer && window.confirm(transferTerms.fields.confirmMarkIncomplete)) {
      const { transferToken } = transfer;

      showInfo(transferTerms.fields.markingIncomplete);

      setReady(false);

      if (transfer) {
        await transfersService.updateTransfer({
          transferToken,
          field: codename,
          type: 'fieldIncomplete'
        });

        await transfersService.getTransfer({ transferToken });
      }

      setReady(true);

      showSuccess(transferTerms.fields.markedIncomplete);
    }
  };

  return (
    <Segment loading={!ready} disabled={completed} className='inherit color'>
      <Header floated='right'>
        <Checkbox
          toggle
          label={completed ? transferTerms.fields.markIncomplete : transferTerms.fields.markCompleted}
          checked={completed}
          onChange={(_, data) => updateCompleted(data)}
        />
      </Header>
      <Header floated='right' content={<Loader active={!fieldReady} inline size='tiny' />} />
      <Header as='h3' content={name} />
      <Divider fitted hidden />
      {comment}
      <Divider fitted hidden />
      <Divider fitted hidden />
      <Segment as={getFieldComponent(type)} {...props} completed={completed} setFieldReady={setFieldReady} />
    </Segment>
  );
};
