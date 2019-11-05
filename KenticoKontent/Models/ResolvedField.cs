using System.Collections.Generic;

using Kentico.Kontent.Delivery;

namespace KenticoKontent.Models
{
    public class ResolvedField
    {
        public string Name { get; set; }

        public string Comment { get; set; }

        public string Type { get; set; }

        public bool Completed { get; set; }

        public IEnumerable<Asset> Assets { get; set; }

        public string DefaultText { get; set; }
    }
}