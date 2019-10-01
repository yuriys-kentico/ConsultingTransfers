namespace AzureStorage.Models
{
    public class TransferToken
    {
        public string Region { get; set; }

        public string ItemName { get; set; }

        public void Deconstruct(out string region, out string itemName)
        {
            region = Region;
            itemName = ItemName;
        }
    }
}