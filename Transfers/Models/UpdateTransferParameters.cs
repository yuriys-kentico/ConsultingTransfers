using System;

namespace Transfers.Models
{
    public enum UpdateType
    {
        Unknown,
        FieldComplete,
        FieldIncomplete
    }

    public class UpdateTransferParameters
    {
        public string? TransferToken { get; set; }

        public string? Field { get; set; }

        public UpdateType Type { get; set; }

        public string? MessageItemCodename { get; set; }

        public void Deconstruct(
            out string transferToken,
            out string? field,
            out UpdateType type,
            out string? messageItemCodename
            )
        {
            transferToken = TransferToken ?? throw new ArgumentNullException(nameof(transferToken));
            field = Field;
            type = Type;
            messageItemCodename = MessageItemCodename;
        }
    }
}