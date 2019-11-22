using System;

namespace Functions.Models
{
    public class CreateTransferRequest
    {
        public string? Name { get; set; }

        public string? Customer { get; set; }

        public string? Requester { get; set; }

        public string? Template { get; set; }

        public string? Localization { get; set; }

        public void Deconstruct(
            out string name,
            out string customer,
            out string requester,
            out string? template,
            out string? localization
            )
        {
            name = Name ?? throw new ArgumentNullException(nameof(Name));
            customer = Customer ?? throw new ArgumentNullException(nameof(Customer));
            requester = Requester ?? throw new ArgumentNullException(nameof(Requester));
            template = Template;
            localization = Localization;
        }
    }
}