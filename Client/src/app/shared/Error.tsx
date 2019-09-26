import React from 'react';
import { Container, Header, Segment } from 'semantic-ui-react';

import { terms } from '../../appSettings.json';
import { RoutedFC } from '../../utilities/routing';

export interface IErrorMessage {
  message: string;
  stack: string;
}

export const Error: RoutedFC = ({ location }) => {
  const errorMessage =
    location && location.state && location.state.message
      ? (location.state as IErrorMessage)
      : { message: terms.genericError, stack: terms.genericStack };

  return (
    <Container text>
      <Segment>
        <Header content={errorMessage.message} />
        {errorMessage.stack}
      </Segment>
    </Container>
  );
};
