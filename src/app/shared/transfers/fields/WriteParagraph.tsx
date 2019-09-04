import React, { FC, useContext, useState } from 'react';
import TextareaAutosize from 'react-autosize-textarea';
import { Form, Header, List, Segment } from 'semantic-ui-react';

import { AppContext } from '../../../AppContext';
import { useContainer } from '../azure/azureStorage';
import { IFieldProps } from '../Fields';
import { TransferContext } from '../TransferContext';

export const WriteParagraph: FC<IFieldProps> = ({ name, comment }) => {
  const { terms } = useContext(AppContext);
  const { request, blobs, uploadFiles } = useContext(TransferContext);
  const { containerURL } = useContainer(request.system.codename);

  const [text, setText] = useState();

  return (
    <List.Item>
      <Segment as={Form}>
        <Header as='h4' content={`${name}`} />
        <TextareaAutosize
          value={text}
          onChange={event => setText(event.currentTarget.value)}
          rows={5}
          placeholder={comment}
        />
      </Segment>
    </List.Item>
  );
};
