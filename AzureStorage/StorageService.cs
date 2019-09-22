using System;

using Core;

using Microsoft.Azure.Storage;
using Microsoft.Azure.Storage.Blob;

namespace AzureStorage
{
    public class StorageService : IStorageService
    {
        public string ContainerToken => "ContainerToken";

        public CloudStorageAccount GetStorageAccount(string accountName)
        {
            var storageConnectionString = AzureFunctionHelper.GetSetting(accountName);

            return CloudStorageAccount.Parse(storageConnectionString);
        }

        public CloudBlobClient GetCloudBlobClient(string accountName)
        {
            var storageAccount = GetStorageAccount(accountName);

            return storageAccount.CreateCloudBlobClient();
        }

        public string GetAccountSasToken(string accountName)
        {
            var storageAccount = GetStorageAccount(accountName);

            var policy = new SharedAccessAccountPolicy
            {
                Permissions = SharedAccessAccountPermissions.Read
                    | SharedAccessAccountPermissions.Write
                    | SharedAccessAccountPermissions.Create
                    | SharedAccessAccountPermissions.Delete
                    | SharedAccessAccountPermissions.List,
                Services = SharedAccessAccountServices.Blob,
                ResourceTypes = SharedAccessAccountResourceTypes.Container
                    | SharedAccessAccountResourceTypes.Object,
                SharedAccessStartTime = DateTime.UtcNow.AddMinutes(-5),
                SharedAccessExpiryTime = DateTime.UtcNow.AddHours(12),
                Protocols = SharedAccessProtocol.HttpsOnly
            };

            return storageAccount.GetSharedAccessSignature(policy);
        }

        public string GetContainerSasToken(string accountName, string containerName)
        {
            var blobClient = GetCloudBlobClient(accountName);

            var container = blobClient.GetContainerReference(containerName);

            // The SharedAccessBlobPolicy class is saved to the container's shared access policies.
            var policy = new SharedAccessBlobPolicy
            {
                Permissions = SharedAccessBlobPermissions.Read
                    | SharedAccessBlobPermissions.Write
                    | SharedAccessBlobPermissions.List,
                SharedAccessStartTime = DateTime.UtcNow.AddMinutes(-5),
                SharedAccessExpiryTime = DateTime.UtcNow.AddHours(12)
            };

            return container.GetSharedAccessSignature(policy, null);
        }

        public string GetSafeStorageName(string itemCodeName)
        {
            return itemCodeName.Replace("_", "");
        }
    }
}