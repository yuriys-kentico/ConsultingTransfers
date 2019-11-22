using AzureStorage.Models;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace AzureStorage
{
    public interface IStorageRepository
    {
        Task<Container> GetContainer(GetContainerParameters getContainerParameters);

        Task<IDictionary<string, File>> GetContainerFiles(GetContainerParameters getContainerParameters);

        string GetSafeContainerName(string? codename);

        string GetSafePathSegment(string? fieldName);

        string GetAdminContainerUrl(GetContainerParameters getContainerParameters);

        string GetPublicContainerUrl(GetContainerParameters getContainerParameters);

        TransferToken DecryptTransferToken(string transferToken);

        string EncryptTransferToken(TransferToken transferToken);

        Task<IEnumerable<Container>> ListContainers();
    }
}