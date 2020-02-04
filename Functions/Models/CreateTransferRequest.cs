using System;

namespace Functions.Models
{
    public class CreateTransferRequest
    {
        public string? Name { private get; set; }

        public string? Customer { private get; set; }

        public string? Requester { private get; set; }

        public string? Template { private get; set; }

        public string? Localization { private get; set; }

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