import { FC, useContext } from 'react';
import React from 'react';
import { List } from 'semantic-ui-react';

import { FieldHolder, IFieldHolderProps } from './FieldHolder';
import { TransferContext } from './TransferContext';

export const Fields: FC = () => {
  const transferContext = useContext(TransferContext);

  let fields: IFieldHolderProps[] = [];

  const strippedJson = transferContext.requestItem.fields
    .replace(/<.*?>/g, '')
    .replace(/\n/g, '')
    .replace(/}{/g, '},{');

  const maybeJson = `[${strippedJson}]`;

  try {
    fields = JSON.parse(maybeJson);
  } catch (error) {
    console.log(maybeJson, error);
  }

  return (
    <List relaxed>
      {fields.map((element, index: number) => (
        <List.Item key={index}>
          <FieldHolder {...element} />
        </List.Item>
      ))}
    </List>
  );
};
