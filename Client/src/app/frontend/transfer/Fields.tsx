import { FC } from 'react';
import React from 'react';
import { List } from 'semantic-ui-react';

import { IAzureFunctionsService } from '../../../services/azureFunctions/AzureFunctionsService';
import { useDependency } from '../../../services/dependencyContainer';
import { useSubscription } from '../../../utilities/observables';
import { FieldHolder } from './FieldHolder';

export const Fields: FC = () => {
  const azureFunctionService = useDependency(IAzureFunctionsService);
  const transfer = useSubscription(azureFunctionService.transfer);

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
