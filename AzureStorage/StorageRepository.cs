using AzureStorage.Models;

using Core;

using Encryption;

using Microsoft.Azure.Storage;
using Microsoft.Azure.Storage.Blob;

using System;
using System.Collections.Generic;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace AzureStorage
{
    public class StorageRepository : IStorageRepository
    {
        private readonly Settings settings;

        private readonly string dollarWeb = "$web";

        private readonly IEncryptionService encryptionService;
        private readonly ICoreContext coreContext;

        public SharedAccessBlobPolicy PublicSharedAccessBlobPolicy => new SharedAccessBlobPolicy
        {
            Permissions = SharedAccessBlobPermissions.Read
                    | SharedAccessBlobPermissions.Write
                    | SharedAccessBlobPermissions.Delete
                    | SharedAccessBlobPermissions.List,
            SharedAccessStartTime = DateTime.UtcNow.AddMinutes(-15),
            SharedAccessExpiryTime = DateTime.UtcNow.AddHours(settings.AzureStorage.Sas.ExpirationHours)
        };

        public SharedAccessAccountPolicy AdminSharedAccessAccountPolicy => new SharedAccessAccountPolicy
        {
            Permissions = SharedAccessAccountPermissions.Read
                    | SharedAccessAccountPermissions.Write
                    | SharedAccessAccountPermissions.Create
                    | SharedAccessAccountPermissions.Delete
                    | SharedAccessAccountPermissions.List,
            Services = SharedAccessAccountServices.Blob,
            ResourceTypes = SharedAccessAccountResourceTypes.Container
                    | SharedAccessAccountResourceTypes.Object,
            SharedAccessStartTime = DateTime.UtcNow.AddMinutes(-15),
            SharedAccessExpiryTime = DateTime.UtcNow.AddHours(settings.AzureStorage.Sas.ExpirationHours),
            Protocols = SharedAccessProtocol.HttpsOnly
        };

        public StorageRepository(
            IEncryptionService encryptionService,
            ICoreContext coreContext,
            Settings settings
            )
        {
            this.encryptionService = encryptionService;
            this.coreContext = coreContext;
            this.settings = settings;
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

            IDictionary<string, File> files = new Dictionary<string, File>();

            BlobContinuationToken? continuationToken = default;

            do
            {
                BlobResultSegment resultSegment = await container
                    .ListBlobsSegmentedAsync(string.Empty, true, BlobListingDetails.None, default, continuationToken, default, default);

                foreach (var blobItem in resultSegment.Results)
                {
                    if (blobItem is CloudBlob cloudBlob)
                    {
                        files.Add(cloudBlob.Name, new File
                        {
                            Url = ReplaceFileEndpoint(cloudBlob.Uri + cloudBlob.GetSharedAccessSignature(PublicSharedAccessBlobPolicy)),
                            Name = cloudBlob.Name.Split('/', StringSplitOptions.RemoveEmptyEntries)[^1],
                            SizeBytes = cloudBlob.Properties.Length,
                            Created = cloudBlob.Properties.Created,
                            Modified = cloudBlob.Properties.LastModified
                        });
                    }
                }

                continuationToken = resultSegment.ContinuationToken;
            } while (continuationToken != default);

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

            var originalUrl = container.Uri + GetStorageAccount().GetSharedAccessSignature(AdminSharedAccessAccountPolicy);

            return ReplaceFileEndpoint(originalUrl);
        }

        public string GetPublicContainerUrl(GetContainerParameters getContainerParameters)
        {
            var container = GetContainerReference(getContainerParameters);

            var originalUrl = container.Uri + container.GetSharedAccessSignature(PublicSharedAccessBlobPolicy);

            return ReplaceFileEndpoint(originalUrl);
        }

        private string ReplaceFileEndpoint(string originalUrl)
        {
            return new StringBuilder(originalUrl)
                .Replace(coreContext.Region.StorageEndpoint, coreContext.Region.FileEndpoint)
                .ToString();
        }

        public TransferToken DecryptTransferToken(string transferToken)
        {
            string transferTokenJson;

            try
            {
                transferTokenJson = encryptionService.Decrypt(transferToken);
            }
            catch
            {
                throw new Exception("Could not decrypt transfer token.");
            }

            var token = CoreHelper.Deserialize<TransferToken>(transferTokenJson);

            var (region, _, localization) = token;

            coreContext.SetRegion(region);
            coreContext.Localization ??= localization;

            return token;
        }

        public string EncryptTransferToken(TransferToken transferToken)
        {
            var transferTokenString = CoreHelper.Serialize(transferToken);
            return encryptionService.Encrypt(transferTokenString);
        }

        public async Task<IEnumerable<Container>> ListContainers()
        {
            var blobClient = GetStorageAccount().CreateCloudBlobClient();

            BlobContinuationToken? continuationToken = default;

            var containers = new List<Container>();

            do
            {
                var resultSegment = await blobClient
                    .ListContainersSegmentedAsync(default, ContainerListingDetails.Metadata, default, continuationToken, default, default);

                foreach (var container in resultSegment.Results)
                {
                    if (container.Name == dollarWeb)
                    {
                        continue;
                    }

                    containers.Add(new Container(container));
                }

                continuationToken = resultSegment.ContinuationToken;
            } while (continuationToken != default);

            return containers;
        }

        private CloudBlobContainer GetContainerReference(GetContainerParameters getContainerParameters)
        {
            var containerName = getContainerParameters.ContainerName;

            var containerRegEx = new Regex("^[a-z0-9](?:[a-z0-9]|(\\-(?!\\-))){1,61}[a-z0-9]$|^\\$root$");

            if (!containerRegEx.IsMatch(containerName))
            {
                containerName = new StringBuilder(containerName)
                    .Replace("-", "")
                    .Append("-container")
                    .ToString();
            }

            return GetStorageAccount()
                .CreateCloudBlobClient()
                .GetContainerReference(containerName);
        }

        private CloudStorageAccount GetStorageAccount()
            => CloudStorageAccount.Parse(coreContext.Region.StorageConnectionString);
    }
}