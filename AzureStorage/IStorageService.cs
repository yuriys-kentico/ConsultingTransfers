using System.Collections.Generic;
using System.Threading.Tasks;

using AzureStorage.Models;

namespace AzureStorage
{
    public interface IStorageService
    {
        string TransferToken { get; }

        string GetAdminContainerUrl(GetContainerParameters getContainerParameters);

        string GetPublicContainerUrl(GetContainerParameters getContainerParameters);

        Task<string> GetContainerTransferToken(GetContainerParameters getContainerParameters);

        Task<IDictionary<string, File>> GetContainerFiles(GetContainerParameters getContainerParameters);

        string GetSafeContainerName(string codename);

        string GetSafePathSegment(string fieldName);

        Task<string> CreateContainer(CreateContainerParameters createContainerParameters);

        Task DeleteContainer(GetContainerParameters deleteContainerParameters);
    }
}