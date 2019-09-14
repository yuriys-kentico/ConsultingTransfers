using System;
using Microsoft.Azure.Storage;
using Microsoft.Azure.Storage.Blob;

namespace Functions
{
    public static class AzureStorageHelper
    {
        public static CloudStorageAccount GetStorageAccount(string accountName)
        {
            var storageConnectionString = Environment.GetEnvironmentVariable(accountName, EnvironmentVariableTarget.Process);

            return CloudStorageAccount.Parse(storageConnectionString);
        }

        public static string GetAccountSasToken(CloudStorageAccount storageAccount, SharedAccessAccountPermissions permissions)
        {
            var policy = new SharedAccessAccountPolicy
            {
                Permissions = permissions,
                Services = SharedAccessAccountServices.Blob,
                ResourceTypes = SharedAccessAccountResourceTypes.Container | SharedAccessAccountResourceTypes.Object,
                SharedAccessExpiryTime = DateTime.UtcNow.AddHours(12),
                Protocols = SharedAccessProtocol.HttpsOnly
            };

            return storageAccount.GetSharedAccessSignature(policy);
        }

        public static string GetContainerSasToken(CloudStorageAccount storageAccount, string containerName, SharedAccessBlobPermissions permissions)
        {
            var blobClient = storageAccount.CreateCloudBlobClient();
            var container = blobClient.GetContainerReference(containerName);

            // The SharedAccessBlobPolicy class is saved to the container's shared access policies
            var policy = new SharedAccessBlobPolicy
            {
                // Set start time to five minutes before now to avoid clock skew
                SharedAccessStartTime = DateTime.UtcNow.AddMinutes(-5),
                SharedAccessExpiryTime = DateTime.UtcNow.AddHours(12),
                Permissions = permissions
            };

            return container.GetSharedAccessSignature(policy, null);
        }

        public static string GetSafeStorageName(string itemCodeName)
        {
            return itemCodeName.Replace("_", "");
        }

        public static string EncryptToken(string source)
        {
            return $"{source}|test";
        }

        public static string DecryptToken(string token)
        {
            return token.Split('|')[0];
        }
    }
}