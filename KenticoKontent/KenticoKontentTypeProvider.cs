using Kentico.Kontent.Delivery;

using KenticoKontent.Models.Delivery;

using System;
using System.Collections.Generic;
using System.Linq;

namespace KenticoKontent
{
    public class KenticoKontentTypeProvider : ITypeProvider
    {
        private static readonly IEnumerable<(Type Type, string Codename)> codenames = new HashSet<(Type, string)>
        {
            (typeof(Field), Field.upload_file),
            (typeof(Field), Field.write_text),
            (typeof(Field), Field.download_asset),
            (typeof(TransferItem), TransferItem.Codename)
        };

        public Type GetType(string codename)
        {
            return codenames.First(pair => pair.Codename == codename).Type;
        }

        public string GetCodename(Type type)
        {
            return codenames.First(pair => pair.Type == type).Codename;
        }
    }
}