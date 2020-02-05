namespace Functions.Models
{
    public class UpdateTransferRequest
    {
        public string? TransferToken { private get; set; }

        public string? Field { private get; set; }

        public string? Type { private get; set; }

        public string? MessageItemCodename { private get; set; }

        public string? Localization { private get; set; }

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