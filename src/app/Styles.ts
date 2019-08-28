import { Theme, makeStyles, createStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      margin: theme.spacing(1)
    },
    root: {
      width: '100%',
      maxWidth: 600
    },
    progress: {
      margin: theme.spacing(2)
    }
  })
);
