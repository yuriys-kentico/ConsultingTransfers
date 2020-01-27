import { lazy } from 'react';

import { FieldType } from './models/FieldType';

const Heading = lazy(() =>
  import('../app/frontend/transfer/fields/Heading').then(module => ({ default: module.Heading }))
);
const WriteText = lazy(() =>
  import('../app/frontend/transfer/fields/WriteText').then(module => ({ default: module.WriteText }))
);
const UploadFile = lazy(() =>
  import('../app/frontend/transfer/fields/UploadFile').then(module => ({ default: module.UploadFile }))
);
const DownloadAsset = lazy(() =>
  import('../app/frontend/transfer/fields/DownloadAsset').then(module => ({ default: module.DownloadAsset }))
);

export const IFieldComponentRepository = 'IFieldComponentRepository';

export class FieldComponentRepository {
  getFieldComponent = (fieldType: FieldType) => {
    switch (fieldType) {
      case 'heading':
        return Heading;
      case 'write_text':
        return WriteText;
      case 'upload_file':
        return UploadFile;
      case 'download_asset':
        return DownloadAsset;
    }
  };
}
