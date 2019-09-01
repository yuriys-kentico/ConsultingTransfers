import React, { FC, useState, useEffect, ReactElement } from 'react';
import { RouteComponentProps } from '@reach/router';
import { Loader } from 'semantic-ui-react';

export type RoutedFC<P = {}> = FC<RouteComponentProps<P>>;
