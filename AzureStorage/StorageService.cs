using System;

using Core;

using Microsoft.Azure.Storage;
using Microsoft.Azure.Storage.Blob;

namespace AzureStorage
{
    public class StorageService : IStorageService
    {
        public string ContainerToken => "ContainerToken";

        public CloudStorageAccount GetStorageAccount(string region)
        {
            var storageConnectionString = AzureFunctionHelper.GetSetting(region);

            return CloudStorageAccount.Parse(storageConnectionString);
        }

        public CloudBlobClient GetCloudBlobClient(string region)
        {
            var storageAccount = GetStorageAccount(region);

            return storageAccount.CreateCloudBlobClient();
        }

        public string GetAdminContainerUrl(string region, string containerName)
        {
            var storageAccount = GetStorageAccount(region);

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

            return GetContainerUrl(region, containerName, storageAccount.GetSharedAccessSignature(policy));
        }

        public string GetPublicContainerUrl(string region, string containerName)
        {
            var blobClient = GetCloudBlobClient(region);

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

            return GetContainerUrl(region, containerName, container.GetSharedAccessSignature(policy, null));
        }

        private string GetContainerUrl(string region, string containerName, string sasToken)
        {
            var accountName = AzureFunctionHelper.GetSetting(region, "accountName");

            return $"https://{accountName}.blob.core.windows.net/{containerName}{sasToken}";
        }

        public string GetSafeStorageName(string itemCodeName)
        {
            return itemCodeName.Replace("_", "");
        }
    }
}