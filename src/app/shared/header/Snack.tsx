import React, { FC, useState, useEffect } from 'react';
import { Message, Progress } from 'semantic-ui-react';

import { toRounded } from '../../../utilities/numbers';
import { UpdateSnackHandler } from './SnackBar';

export type SnackType = 'success' | 'info' | 'warning' | 'error' | 'update';

export interface ISnack {
  text: string;
  type: SnackType;
  update?: UpdateSnackHandler;
}

export interface IUpdateMessage {
  progress: number;
  text: string;
}

export const Snack: FC<ISnack> = ({ type, text, update }) => {
  const [progress, setProgress] = useState({ progress: 0, text: '' });

  useEffect(() => {
    if (update) {
      const subscription = update.subscribe({next: update => {
        setProgress(update);
      }});

      return () => subscription.unsubscribe();
    }
  });

  switch (type) {
    case 'success':
      return <Message floating compact content={text} success />;
    case 'info':
      return <Message floating compact content={text} info />;
    case 'warning':
      return <Message floating compact content={text} warning />;
    case 'error':
      return <Message floating compact content={text} error />;
    case 'update':
      return (
        <Message floating compact info>
          {text}
          {update && (
            <Progress percent={toRounded(progress.progress * 100)} content={progress.text} progress indicating />
          )}
        </Message>
      );
  }
};
