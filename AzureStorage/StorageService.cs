using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

using AzureStorage.Models;

using Core;

using Encryption;

using Microsoft.Azure.Storage;
using Microsoft.Azure.Storage.Blob;

using Newtonsoft.Json;

namespace AzureStorage
{
    public class StorageService : IStorageService
    {
        private readonly IEncryptionService encryptionService;

        public string TransferToken => nameof(TransferToken);

        public SharedAccessBlobPolicy PublicSharedAccessBlobPolicy => new SharedAccessBlobPolicy
        {
            Permissions = SharedAccessBlobPermissions.Read
                    | SharedAccessBlobPermissions.Write
                    | SharedAccessBlobPermissions.List,
            SharedAccessStartTime = DateTime.UtcNow.AddMinutes(-5),
            SharedAccessExpiryTime = DateTime.UtcNow.AddHours(12)
        };

        public StorageService(IEncryptionService encryptionService)
        {
            this.encryptionService = encryptionService;
        }

        public string GetAdminContainerUrl(GetContainerParameters getContainerParameters)
        {
            var (region, _) = getContainerParameters;

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

            var container = GetContainer(getContainerParameters);

            return container.Uri + storageAccount.GetSharedAccessSignature(policy);
        }

        public string GetPublicContainerUrl(GetContainerParameters getContainerParameters)
        {
            var container = GetContainer(getContainerParameters);

            // The policy is saved to the container's shared access policies.
            return container.Uri + container.GetSharedAccessSignature(PublicSharedAccessBlobPolicy);
        }

        public string GetSafeContainerName(string codename)
        {
            return codename.Replace("_", "");
        }

        public string GetSafePathSegment(string fieldName)
        {
            return Regex.Replace(fieldName.ToLower(), "[^a-zA-Z0-9-_]", "");
        }

        public async Task<string> GetContainerTransferToken(GetContainerParameters getContainerParameters)
        {
            var container = GetContainer(getContainerParameters);

            await container.FetchAttributesAsync();

            string transferToken = null;

            container?.Metadata.TryGetValue(TransferToken, out transferToken);

            return transferToken;
        }

        public async Task<IDictionary<string, File>> GetContainerFiles(GetContainerParameters getContainerParameters)
        {
            var container = GetContainer(getContainerParameters);

            string getBlobItemName(string prefix)
            {
                var parts = prefix.Split('/', StringSplitOptions.RemoveEmptyEntries);

                return parts[parts.Length - 1];
            }

            IDictionary<string, File> files = new Dictionary<string, File>();

            BlobContinuationToken continuationToken;

            do
            {
                BlobResultSegment resultSegment = await container
                    .ListBlobsSegmentedAsync(string.Empty, true, BlobListingDetails.None, null, null, null, null);

                foreach (var blobItem in resultSegment.Results)
                {
                    if (blobItem is CloudBlob cloudBlob)
                    {
                        files.Add(cloudBlob.Name, new File
                        {
                            Url = cloudBlob.Uri + cloudBlob.GetSharedAccessSignature(PublicSharedAccessBlobPolicy),
                            Name = getBlobItemName(cloudBlob.Name),
                            SizeBytes = cloudBlob.Properties.Length,
                            Created = cloudBlob.Properties.Created,
                            Modified = cloudBlob.Properties.LastModified
                        });
                    }
                }

                continuationToken = resultSegment.ContinuationToken;
            } while (continuationToken != null);

            return files;
        }

        public async Task<string> CreateContainer(CreateContainerParameters createContainerParameters)
        {
            var (region, containerName, transferToken) = createContainerParameters;

            var container = GetContainer(new GetContainerParameters
            {
                Region = region,
                ContainerName = containerName
            });

            await container.CreateIfNotExistsAsync();

            string encodedTransferToken = encryptionService.Encrypt(JsonConvert.SerializeObject(transferToken));

            container.Metadata.Add(TransferToken, encodedTransferToken);

            await container.SetMetadataAsync();

            return encodedTransferToken;
        }

        public async Task DeleteContainer(GetContainerParameters getContainerParameters)
        {
            var container = GetContainer(getContainerParameters);

            await container.DeleteAsync();
        }

        private CloudBlobContainer GetContainer(GetContainerParameters getContainerParameters)
        {
            var (region, containerName) = getContainerParameters;

            var storageAccount = GetStorageAccount(region);
            var blobClient = storageAccount.CreateCloudBlobClient();

            return blobClient.GetContainerReference(containerName);
        }

        private CloudStorageAccount GetStorageAccount(string region)
        {
            var storageConnectionString = CoreHelper.GetSetting(region);

            return CloudStorageAccount.Parse(storageConnectionString);
        }
    }
}