﻿namespace Functions.Models
{
    public class CreateTransferRequest
    {
        public string? Name { private get; set; }

        public string? Customer { private get; set; }

        public string? Template { private get; set; }

        public string? Localization { private get; set; }

        public void Deconstruct(
            out string? name,
            out string? customer,
            out string? template,
            out string? localization
            )
        {
            name = Name;
            customer = Customer;
            template = Template;
            localization = Localization;
        }
    }
}