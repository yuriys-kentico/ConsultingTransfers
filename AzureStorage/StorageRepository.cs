using AzureStorage.Models;

using Core;

using Encryption;

using Microsoft.Azure.Storage;
using Microsoft.Azure.Storage.Blob;

using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace AzureStorage
{
    public class StorageRepository : IStorageRepository
    {
        private readonly string dollarWeb = "$web";

        private readonly IEncryptionService encryptionService;
        private readonly ICoreContext coreContext;

        public static SharedAccessBlobPolicy PublicSharedAccessBlobPolicy => new SharedAccessBlobPolicy
        {
            Permissions = SharedAccessBlobPermissions.Read
                    | SharedAccessBlobPermissions.Write
                    | SharedAccessBlobPermissions.List,
            SharedAccessStartTime = DateTime.UtcNow.AddMinutes(-5),
            SharedAccessExpiryTime = DateTime.UtcNow.AddHours(12)
        };

        public static SharedAccessAccountPolicy AdminSharedAccessAccountPolicy => new SharedAccessAccountPolicy
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

        public StorageRepository(
            IEncryptionService encryptionService,
            ICoreContext coreContext
            )
        {
            this.encryptionService = encryptionService;
            this.coreContext = coreContext;
        }

        public async Task<Container> GetContainer(GetContainerParameters getContainerParameters)
        {
            var container = GetContainerReference(getContainerParameters);

            await container.CreateIfNotExistsAsync();

            await container.FetchAttributesAsync();

            return new Container(container);
        }

        public async Task<IDictionary<string, File>> GetContainerFiles(GetContainerParameters getContainerParameters)
        {
            var container = GetContainerReference(getContainerParameters);

            static string getBlobItemName(string prefix)
            {
                var parts = prefix.Split('/', StringSplitOptions.RemoveEmptyEntries);

                return parts[^1];
            }

            IDictionary<string, File> files = new Dictionary<string, File>();

            BlobContinuationToken? continuationToken = null;

            do
            {
                BlobResultSegment resultSegment = await container
                    .ListBlobsSegmentedAsync(string.Empty, true, BlobListingDetails.None, null, continuationToken, null, null);

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

        public string GetSafeContainerName(string? codename)
        {
            return codename?.Replace("_", "") ?? "";
        }

        public string GetSafePathSegment(string? fieldName)
        {
            return Regex.Replace((fieldName ?? "").ToLower(), "[^a-zA-Z0-9-_]", "");
        }

        public string GetAdminContainerUrl(GetContainerParameters getContainerParameters)
        {
            var container = GetContainerReference(getContainerParameters);

            return container.Uri + GetStorageAccount().GetSharedAccessSignature(AdminSharedAccessAccountPolicy);
        }

        public string GetPublicContainerUrl(GetContainerParameters getContainerParameters)
        {
            var container = GetContainerReference(getContainerParameters);

            // The policy is saved to the container's shared access policies.
            return container.Uri + container.GetSharedAccessSignature(PublicSharedAccessBlobPolicy);
        }

        public TransferToken DecryptTransferToken(string transferToken)
        {
            var transferTokenJson = encryptionService.Decrypt(transferToken);
            var token = CoreHelper.Deserialize<TransferToken>(transferTokenJson);

            var (region, _, localization) = token;

            coreContext.Region ??= region;
            coreContext.Localization ??= localization;

            return token;
        }

        public string EncryptTransferToken(TransferToken transferToken)
        {
            transferToken.Region ??= coreContext.Region;
            transferToken.Localization ??= coreContext.Localization;

            var transferTokenString = CoreHelper.Serialize(transferToken);
            return encryptionService.Encrypt(transferTokenString);
        }

        public async Task<IEnumerable<Container>> ListContainers()
        {
            var blobClient = GetStorageAccount().CreateCloudBlobClient();

            BlobContinuationToken? continuationToken = null;

            var containers = new List<Container>();

            do
            {
                var resultSegment = await blobClient
                    .ListContainersSegmentedAsync(null, ContainerListingDetails.Metadata, null, continuationToken, null, null);

                foreach (var container in resultSegment.Results)
                {
                    if (container.Name == dollarWeb)
                    {
                        continue;
                    }

                    containers.Add(new Container(container));
                }

                continuationToken = resultSegment.ContinuationToken;
            } while (continuationToken != null);

            return containers;
        }

        private CloudBlobContainer GetContainerReference(GetContainerParameters getContainerParameters)
            => GetStorageAccount()
            .CreateCloudBlobClient()
            .GetContainerReference(getContainerParameters.ContainerName);

        private CloudStorageAccount GetStorageAccount()
            => CloudStorageAccount.Parse(CoreHelper.GetSetting(coreContext.Region));
    }
}