namespace Functions.Models
{
    public class UpdateTransferRequest
    {
        public string TransferToken { get; set; }

        public string FieldName { get; set; }

        public string MessageItemCodename { get; set; }

        public void Deconstruct(out string transferToken, out string fieldName, out string messageItemCodename)
        {
            transferToken = TransferToken;
            fieldName = FieldName;
            messageItemCodename = MessageItemCodename;
        }
    }
}