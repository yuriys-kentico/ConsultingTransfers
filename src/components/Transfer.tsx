import React, { useState, useEffect } from 'react';
import { RoutedFC } from '../types/routing/RoutedFC';
import { Typography, Box } from '@material-ui/core';
import { AppSettings } from '../types/AppSettings';
import { DeliveryClient, ContentItem } from 'kentico-cloud-delivery';

export interface ITransferProps {
  urlSlug: string;
}

export const Transfer: RoutedFC<ITransferProps> = props => {
  const deliveryClient = new DeliveryClient({ ...AppSettings.kenticoCloud });

  const [item, setItem] = useState<ContentItem>();

  useEffect(() => {
    if (props.urlSlug) {
      deliveryClient
        .items()
        .type('consulting_request')
        .equalsFilter('elements.url', props.urlSlug)
        .toObservable()
        .subscribe(response => {
          setItem(response.items[0]);
        });
    }
  }, []);

  return (
    <div>
      <Box m={3}>
        <Typography variant='h4' gutterBottom>
          {`Transfer ${item !== undefined ? item.system.name : props.urlSlug}`}
        </Typography>
        {item !== undefined
          ? item.fields.itemCodenames.map((element: string) => (
              <div>
                <span>{element}</span>
              </div>
            ))
          : null}
      </Box>
    </div>
  );
};
