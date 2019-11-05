namespace AzureStorage.Models
{
    public class GetContainerParameters
    {
        public string Region { get; set; }

        public string ContainerName { get; set; }

        public void Deconstruct(out string region, out string containerName)
        {
            region = Region;
            containerName = ContainerName;
        }
    }
}