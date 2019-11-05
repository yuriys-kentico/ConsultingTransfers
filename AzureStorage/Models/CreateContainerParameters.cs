using Encryption.Models;

namespace AzureStorage.Models
{
    public class CreateContainerParameters
    {
        public string Region { get; set; }

        public string ContainerName { get; set; }

        public TransferToken TransferToken { get; set; }

        public void Deconstruct(out string region, out string containerName, out TransferToken transferToken)
        {
            region = Region;
            containerName = ContainerName;
            transferToken = TransferToken;
        }
    }
}