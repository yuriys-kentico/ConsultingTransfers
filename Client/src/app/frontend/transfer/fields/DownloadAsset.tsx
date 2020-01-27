import React, { FC } from 'react';
import { Card, Header, Icon, Label, SemanticICONS } from 'semantic-ui-react';

import { getSizeText } from '../../../../utilities/numbers';
import { IFieldProps } from '../FieldHolder';

export const DownloadAsset: FC<IFieldProps> = ({ headingBlock, commentBlock, assets }) => {
  const getIconName = (type: string): SemanticICONS => {
    switch (type) {
      case 'text/plain':
        return 'file text';
      case 'application/json':
      case 'application/xml':
      case 'text/xml':
      case 'text/javascript':
        return 'file code';
      case 'image/jpeg':
      case 'image/png':
      case 'image/gif':
      case 'image/tiff':
        return 'file image';
      case 'video/mp4':
      case 'video/x-msvideo':
        return 'file video';
      case 'application/pdf':
        return 'file pdf';
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      case 'application/vnd.ms-excel':
        return 'file excel';
      case 'application/x-zip-compressed':
        return 'file archive';
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        return 'file powerpoint';
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return 'file word';
      case 'application/x-msdownload':
      case 'application/octet-stream':
      default:
        return 'file';
    }
  };

  const getSizeLabel = (assetSize: number) => {
    const [size, unit] = getSizeText(assetSize);

    return `${size} ${unit}`;
  };

  return (
    <>
      {headingBlock()}
      {commentBlock()}
      <Card.Group>
        {assets &&
          assets.map((asset, index) => (
            <Card key={index} href={asset.url} centered>
              <Card.Content textAlign='center'>
                <Icon name={getIconName(asset.type)} size='huge' />
                <Header as='h5' sub content={asset.name} />
                <Label content={getSizeLabel(asset.size)} icon='save' size='tiny' />
                <Card.Description>{asset.description}</Card.Description>
              </Card.Content>
            </Card>
          ))}
      </Card.Group>
    </>
  );
};
