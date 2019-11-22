namespace Functions.Models
{
    public class UpdateTransferRequest
    {
        public string? TransferToken { get; set; }

        public string? Field { get; set; }

        public string? Type { get; set; }

        public string? MessageItemCodename { get; set; }

        public string? Localization { get; set; }

        public void Deconstruct(
            out string? transferToken,
            out string? field,
            out string? type,
            out string? messageItemCodename,
            out string? localization
            )
        {
            transferToken = TransferToken;
            field = Field;
            type = Type;
            messageItemCodename = MessageItemCodename;
            localization = Localization;
        }
    }
}