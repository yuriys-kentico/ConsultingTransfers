import React, { useState, useEffect, useContext } from 'react';
import { RoutedFC } from '../RoutedFC';
import { AppContext } from '../AppContext';
import { Header, Segment, Divider, Placeholder } from 'semantic-ui-react';
import { getDeliveryClient } from './kenticoCloud/kenticoCloud';
import { ConsultingRequest } from './kenticoCloud/ConsultingRequest';
import { Fields } from './Fields';
import { AdminControls } from '../authenticated/admin/AdminControls';
import { ITransferContext, TransferContext } from './TransferContext';

export interface ITransferProps {
  urlSlug: string;
  authenticated: boolean;
}

export const Transfer: RoutedFC<ITransferProps> = props => {
  const appContext = useContext(AppContext);

  const [transferContext, setTransferContext] = useState<ITransferContext>();

  useEffect(() => {
    if (props.urlSlug) {
      const deliveryClient = getDeliveryClient({ ...appContext.kenticoCloud });

      deliveryClient
        .items<ConsultingRequest>()
        .type('consulting_request')
        .equalsFilter('elements.url', props.urlSlug)
        .toObservable()
        .subscribe(response => {
          setTransferContext({ item: response.items[0] });
        });
    }
  }, [appContext.kenticoCloud, props.urlSlug]);

  return (
    <Segment basic>
      {!transferContext ? (
        <Placeholder>
          <Placeholder.Header>
            <Placeholder.Line />
          </Placeholder.Header>
        </Placeholder>
      ) : (
        <TransferContext.Provider value={transferContext}>
          <div>
            <Header as='h2' content={`Transfer ${transferContext.item.system.name}`} />
            <Fields />
            <Divider />
            {props.authenticated && <AdminControls />}
          </div>
        </TransferContext.Provider>
      )}
    </Segment>
  );
};
