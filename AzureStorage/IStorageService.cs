using Microsoft.Azure.Storage;
using Microsoft.Azure.Storage.Blob;

namespace AzureStorage
{
    public interface IStorageService
    {
        string ContainerToken { get; }

        string GetAccountSasToken(string accountName);

        CloudBlobClient GetCloudBlobClient(string accountName);

        string GetContainerSasToken(string accountName, string containerName);

        string GetSafeStorageName(string itemCodeName);

        CloudStorageAccount GetStorageAccount(string accountName);
    }
}