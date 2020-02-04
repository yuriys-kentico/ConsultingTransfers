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
        public string? TransferToken { private get; set; }

        public string? Field { private get; set; }

        public UpdateType Type { private get; set; }

        public string? MessageItemCodename { private get; set; }

        public void Deconstruct(
            out string transferToken,
            out string? field,
            out UpdateType type,
            out string? messageItemCodename
            )
        {
            transferToken = TransferToken ?? throw new ArgumentNullException(nameof(TransferToken));
            field = Field;
            type = Type;
            messageItemCodename = MessageItemCodename;
        }
    }
}