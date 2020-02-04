using KenticoKontent.Models.ContentManagement;

using System;

namespace KenticoKontent.Models
{
    public class UpsertLanguageVariantParameters
    {
        public string? Codename { private get; set; }

        public LanguageVariant? Variant { private get; set; }

        public void Deconstruct(
            out string codename,
            out LanguageVariant variant
            )
        {
            codename = Codename ?? throw new ArgumentNullException(nameof(Codename));
            variant = Variant ?? throw new ArgumentNullException(nameof(Variant));
        }
    }
}