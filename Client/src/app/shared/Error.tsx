import React from 'react';
import { Container, Header, Segment } from 'semantic-ui-react';

import { errors } from '../../terms.en-us.json';
import { RoutedFC } from '../../utilities/routing';

interface IErrorProps {
  message?: string;
  stack?: string;
}

export const Error: RoutedFC<IErrorProps> = ({ location, message, stack }) => {
  let errorMessage: IErrorProps = { message: errors.genericError, stack: errors.genericStack };

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
