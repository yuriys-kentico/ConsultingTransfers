namespace Transfers.Models
{
    public class UpdateTransferParameters
    {
        public string Region { get; set; }

        public string Codename { get; set; }

        public string TransferToken { get; set; }

        public string FieldName { get; set; }

        public string MessageItemCodename { get; set; }

        public void Deconstruct(out string region, out string containerName, out string transferToken, out string fieldName, out string messageItemCodename)
        {
            region = Region;
            containerName = Codename;
            transferToken = TransferToken;
            fieldName = FieldName;
            messageItemCodename = MessageItemCodename;
        }
    }
}