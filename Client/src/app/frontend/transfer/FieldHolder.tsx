import React, { FC, memo, ReactNode, useCallback, useContext, useState } from 'react';
import { Checkbox, Divider, Header, Loader, Segment } from 'semantic-ui-react';

import { kenticoKontent } from '../../../appSettings.json';
import { useDependency } from '../../../services/dependencyContainer';
import { IFieldComponentRepository } from '../../../services/FieldComponentRepository';
import { IField } from '../../../services/models/IField';
import { ITransfersService } from '../../../services/TransfersService';
import { transfer as transferTerms } from '../../../terms.en-us.json';
import { useSubscription } from '../../../utilities/observables';
import { Tooltip } from '../../shared/Tooltip';
import { MessageContext } from '../header/MessageContext';

export interface IFieldProps extends IField {
  headingBlock: () => ReactNode;
  commentBlock: () => ReactNode;
  setFieldReady: (ready: boolean) => void;
  setFieldCanBeCompleted: (completed: boolean) => void;
}

export const FieldHolder: FC<IField> = memo(props => {
  const { name, codename, comment, completed, type } = props;

  const { showInfo, showSuccess } = useContext(MessageContext);
  const [ready, setReady] = useState(true);
  const [fieldReady, setFieldReady] = useState(true);
  const [fieldCanBeCompleted, setFieldCanBeCompleted] = useState(false);

  const transfersService = useDependency(ITransfersService);
  const transfer = useSubscription(transfersService.transfer);

  const fieldComponentRepository = useDependency(IFieldComponentRepository);

  const headingBlock = useCallback(() => {
    const updateCompleted = async (completed?: boolean) => {
      if (transfer) {
        const { transferToken } = transfer;

        if (completed) {
          showInfo(transferTerms.fields.markingCompleted);
          setReady(false);

          await transfersService.updateTransfer({
            transferToken,
            field: codename,
            type: 'fieldComplete',
            messageItemCodename: kenticoKontent.updateTransferMessageItemCodename
          });

          await transfersService.getTransfer({ transferToken });

          setReady(true);
          showSuccess(transferTerms.fields.markedCompleted);
        } else {
          showInfo(transferTerms.fields.markingIncomplete);
          setReady(false);

          await transfersService.updateTransfer({
            transferToken,
            field: codename,
            type: 'fieldIncomplete'
          });

          await transfersService.getTransfer({ transferToken });

          setReady(true);
          showSuccess(transferTerms.fields.markedIncomplete);
        }
      }
    };

    return (
      <>
        <Header floated='right'>
          {fieldCanBeCompleted && (
            <Tooltip label={completed ? transferTerms.fields.markIncomplete : transferTerms.fields.markCompleted}>
              <Checkbox toggle checked={completed} onChange={(_, data) => updateCompleted(data.checked)} />
            </Tooltip>
          )}
        </Header>
        <Header floated='right' content={<Loader active={!fieldReady} inline size='tiny' />} />
        <Header as='h3' content={name} />
        <Divider fitted hidden />
        <Divider fitted hidden />
      </>
    );
  }, [codename, completed, fieldCanBeCompleted, fieldReady, name, showInfo, showSuccess, transfer, transfersService]);

  const commentBlock = useCallback(
    () => (
      <>
        <i>{comment}</i>
        <Divider fitted hidden />
        <Divider fitted hidden />
        <Divider fitted hidden />
      </>
    ),
    [comment]
  );

  return (
    <Segment basic className='inherit color' loading={!ready} disabled={completed}>
      <Segment
        as={fieldComponentRepository.getFieldComponent(type)}
        {...props}
        completed={completed}
        headingBlock={headingBlock}
        commentBlock={commentBlock}
        setFieldReady={useCallback(setFieldReady, [])}
        setFieldCanBeCompleted={useCallback(setFieldCanBeCompleted, [])}
      />
    </Segment>
  );
});
