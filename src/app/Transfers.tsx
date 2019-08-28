import React, { useState, useEffect, useContext } from 'react';

import { RoutedFC } from '../routing/RoutedFC';
import { Typography, Box, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton } from '@material-ui/core';
import { AppContext } from './AppContext';
import EditIcon from '@material-ui/icons/Edit';
import { DeliveryClient, ContentItem } from 'kentico-cloud-delivery';
import { Link } from '@reach/router';
import { useStyles } from './Styles';

export const Transfers: RoutedFC = () => {
  const appContext = useContext(AppContext);

  const [items, setItems] = useState<ContentItem[]>();

  useEffect(() => {
    const deliveryClient = new DeliveryClient({ ...appContext.kenticoCloud });

    deliveryClient
      .items()
      .type('consulting_request')
      .toObservable()
      .subscribe(response => {
        setItems(response.items);
      });
  }, [appContext.kenticoCloud]);

  function renderItems() {
    if (items) {
      return items.map((item, index) => (
        <ListItem key={index}>
          <ListItemText primary={`${item.system.name}`} />
          <ListItemSecondaryAction>
            <IconButton component={Link} to={`${item.url.value}`}>
              <EditIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ));
    }
  }

  const styles = useStyles();

  return (
    <Box m={3} className={styles.root}>
      <Typography variant='h4' gutterBottom>
        Active transfers:
      </Typography>
      <List>{renderItems()}</List>
    </Box>
  );
};
