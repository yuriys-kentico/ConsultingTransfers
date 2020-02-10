using System;
using System.Collections.Generic;

namespace KenticoKontent.Models
{
    public class CreateTransferItemParameters
    {
        public string? Name { private get; set; }

        public string? Customer { private get; set; }

        public IEnumerable<ResolvedField>? Fields { private get; set; }

        public void Deconstruct(
            out string name,
            out string customer,
            out IEnumerable<ResolvedField>? fields
            )
        {
            name = Name ?? throw new ArgumentNullException(nameof(Name));
            customer = Customer ?? throw new ArgumentNullException(nameof(Customer));
            fields = Fields;
        }
    }
}