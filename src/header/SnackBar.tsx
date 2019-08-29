import { FC, useContext } from 'react';
import React from 'react';
import { Segment, Message } from 'semantic-ui-react';
import { HeaderContext } from './HeaderContext';

export interface ISnack {
  text: string;
}

export interface ISnackBarProps {}

export const SnackBar: FC<ISnackBarProps> = props => {
  const { snacks } = useContext(HeaderContext);

  // const processQueue = () => {
  //   const next = queue.shift();

  //   if (next) {
  //     setMessage(next);
  //     setSnackbarShow(true);
  //   }
  // };

  // const handleClose = (_event: SyntheticEvent | MouseEvent, reason?: string) => {
  //   if (reason === 'clickaway') {
  //     return;
  //   }
  //   setSnackbarShow(false);
  // };

  return (
    <div
      style={
        {
          position: 'fixed',
          bottom: '0',
          zIndex: '1000'
        } as any
      }
    >
      {snacks.map((snack, index) => (
        <Segment basic key={index}>
          <Message floating compact content={snack.text} />
        </Segment>
      ))}
    </div>
  );
};
