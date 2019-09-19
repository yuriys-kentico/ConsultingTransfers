using System;

using Microsoft.Azure.Storage;
using Microsoft.Azure.Storage.Blob;

namespace Functions
{
    public static class AzureStorageHelper
    {
        public const string ContainerToken = "ContainerToken";

        public static CloudStorageAccount GetStorageAccount(string accountName)
        {
            var storageConnectionString = AzureFunctionHelper.GetEnvironmentVariable(accountName);

            return CloudStorageAccount.Parse(storageConnectionString);
        }

        public static CloudBlobClient GetCloudBlobClient(string accountName)
        {
            var storageAccount = GetStorageAccount(accountName);

            return storageAccount.CreateCloudBlobClient();
        }

        public static string GetAccountSasToken(string accountName, SharedAccessAccountPermissions permissions)
        {
            var storageAccount = GetStorageAccount(accountName);

            var policy = new SharedAccessAccountPolicy
            {
                Permissions = permissions,
                Services = SharedAccessAccountServices.Blob,
                ResourceTypes = SharedAccessAccountResourceTypes.Container | SharedAccessAccountResourceTypes.Object,
                SharedAccessStartTime = DateTime.UtcNow.AddMinutes(-5),
                SharedAccessExpiryTime = DateTime.UtcNow.AddHours(12),
                Protocols = SharedAccessProtocol.HttpsOnly
            };

            return storageAccount.GetSharedAccessSignature(policy);
        }

        public static string GetContainerSasToken(string accountName, string containerName, SharedAccessBlobPermissions permissions)
        {
            var blobClient = GetCloudBlobClient(accountName);

            var container = blobClient.GetContainerReference(containerName);

            // The SharedAccessBlobPolicy class is saved to the container's shared access policies
            var policy = new SharedAccessBlobPolicy
            {
                Permissions = permissions,
                SharedAccessStartTime = DateTime.UtcNow.AddMinutes(-5),
                SharedAccessExpiryTime = DateTime.UtcNow.AddHours(12)
            };

            return container.GetSharedAccessSignature(policy, null);
        }

        public static string GetSafeStorageName(string itemCodeName)
        {
            return itemCodeName.Replace("_", "");
        }
    }
}