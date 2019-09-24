using Microsoft.Azure.Storage;
using Microsoft.Azure.Storage.Blob;

namespace AzureStorage
{
    public interface IStorageService
    {
        string ContainerToken { get; }

        CloudStorageAccount GetStorageAccount(string region);

        CloudBlobClient GetCloudBlobClient(string region);

        string GetAdminContainerUrl(string region, string containerName);

        string GetPublicContainerUrl(string region, string containerName);

        string GetSafeStorageName(string itemCodeName);
    }
}