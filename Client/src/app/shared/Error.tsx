import React from 'react';
import { Container, Header, Segment } from 'semantic-ui-react';

import { terms } from '../../appSettings.json';
import { RoutedFC } from '../../utilities/routing';

export interface IErrorProps {
  message?: string;
  stack?: string;
}

export const Error: RoutedFC<IErrorProps> = ({ location, message, stack }) => {
  let errorMessage: IErrorProps = { message: terms.errors.genericError, stack: terms.errors.genericStack };

  message && (errorMessage.message = message);
  stack && (errorMessage.stack = stack);

  location && location.state && (errorMessage = { ...errorMessage, ...location.state });

  return (
    <Container text>
      <Segment>
        <Header content={errorMessage.message} />
        {errorMessage.stack}
      </Segment>
    </Container>
  );
};
