﻿using System;

namespace Transfers.Models
{
    public class CreateTransferParameters
    {
        public string? Name { get; set; }

        public string? Customer { get; set; }

        public string? TemplateItemCodename { get; set; }

        public void Deconstruct(
            out string name,
            out string customer,
            out string? templateItemCodename
            )
        {
            name = Name ?? throw new ArgumentNullException(nameof(Name));
            customer = Customer ?? throw new ArgumentNullException(nameof(Customer));
            templateItemCodename = TemplateItemCodename;
        }
    }
}