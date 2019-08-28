import { FC } from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import React from 'react';
import { useStyles } from './Styles';

export const Loading: FC = () => {
  const styles = useStyles();

  return (
    <div>
      <CircularProgress className={styles.progress} />
    </div>
  );
};
