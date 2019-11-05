using System.Collections.Generic;

namespace KenticoKontent.Models
{
    public class CreateTransferItemParameters
    {
        public string Region { get; set; }

        public string Name { get; set; }

        public string Customer { get; set; }

        public string Requester { get; set; }

        public IEnumerable<ResolvedField> Fields { get; set; }

        public string Localization { get; set; }

        public void Deconstruct(
            out string region,
            out string name,
            out string customer,
            out string requester,
            out IEnumerable<ResolvedField> fields,
            out string localization
            )
        {
            region = Region;
            name = Name;
            customer = Customer;
            requester = Requester;
            fields = Fields;
            localization = Localization;
        }
    }
}