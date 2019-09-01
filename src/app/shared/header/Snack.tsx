import { FC, useState } from 'react';
import React from 'react';
import { Message } from 'semantic-ui-react';
import { ISnack } from './SnackBar';
import { toRounded } from '../../../utilities/numbers';

export const Snack: FC<ISnack> = props => {
  const [progress, setProgress] = useState({ progress: 0, text: '' });

  if (props.update) {
    props.update.subscribe(update => {
      console.log(update);
      setProgress(update);
    });
  }

  switch (props.type) {
    case 'success':
      return <Message floating compact content={props.text} success />;
    case 'info':
      return <Message floating compact content={props.text} info />;
    case 'warning':
      return <Message floating compact content={props.text} warning />;
    case 'error':
      return <Message floating compact content={props.text} error />;
    case 'update':
      return (
        <Message
          floating
          compact
          content={`${props.text} ${progress.text} (${toRounded(progress.progress * 100)}%)`}
          info
        />
      );
  }
};
