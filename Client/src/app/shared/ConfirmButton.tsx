import React, { FC, useState } from 'react';
import { Button, ButtonProps, Confirm, ConfirmProps } from 'semantic-ui-react';

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
