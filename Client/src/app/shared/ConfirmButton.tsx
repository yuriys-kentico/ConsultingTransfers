import React, { FC, useState } from 'react';
import { Button, ButtonProps, Confirm, ConfirmProps } from 'semantic-ui-react';

import { transfer } from '../../terms.en-us.json';

interface IConfirmButtonProps {
  buttonProps: ButtonProps;
  confirmProps: ConfirmProps;
  onConfirm: () => void;
}

export const ConfirmButton: FC<IConfirmButtonProps> = ({ confirmProps, buttonProps, onConfirm }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setConfirmOpen(true)} {...buttonProps} />
      <Confirm
        open={confirmOpen}
        cancelButton={{ content: transfer.confirm.no }}
        confirmButton={{ color: 'green', content: transfer.confirm.yes, primary: false }}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          onConfirm();
        }}
        {...confirmProps}
      />
    </>
  );
};
