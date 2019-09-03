import { FC } from 'react';
import React from 'react';
import { Loader, Segment } from 'semantic-ui-react';

export const Loading: FC = () => <Loader as={Segment} active basic size='large' />;
