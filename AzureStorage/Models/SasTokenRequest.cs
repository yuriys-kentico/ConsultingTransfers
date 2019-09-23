namespace AzureStorage.Models
{
    public class SasTokenRequest
    {
        public string AccountName { get; set; }

        public string ContainerToken { get; set; }

        public void Deconstruct(out string accountName, out string containerToken)
        {
            accountName = AccountName;
            containerToken = ContainerToken;
        }
    }
}