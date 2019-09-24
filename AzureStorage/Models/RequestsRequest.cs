namespace AzureStorage.Models
{
    public class RequestsRequest
    {
        public string Region { get; set; }

        public string ContainerToken { get; set; }

        public void Deconstruct(out string region, out string containerToken)
        {
            region = Region;
            containerToken = ContainerToken;
        }
    }
}