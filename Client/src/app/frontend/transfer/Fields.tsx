import React, { FC } from 'react';
import { List } from 'semantic-ui-react';

import { useDependency } from '../../../services/dependencyContainer';
import { ITransfersService } from '../../../services/TransfersService';
import { useSubscription } from '../../../utilities/observables';
import { FieldHolder } from './FieldHolder';

export const Fields: FC = () => {
  const transfersService = useDependency(ITransfersService);
  const transfer = useSubscription(transfersService.transfer);

  return (
    <List relaxed>
      {transfer &&
        transfer.fields.map((element, index: number) => (
          <List.Item key={index}>
            <FieldHolder {...element} />
          </List.Item>
        ))}
    </List>
  );
};
