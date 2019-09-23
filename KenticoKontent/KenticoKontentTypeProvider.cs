using System;
using System.Collections.Generic;
using System.Linq;

using KenticoCloud.Delivery;

using KenticoKontent.Models;

namespace KenticoKontent
{
    public class KenticoKontentTypeProvider : ITypeProvider
    {
        private static readonly IEnumerable<(Type type, string codename)> codenames = new HashSet<(Type, string)>
        {
            (typeof(Field), Field.Upload_file),
            (typeof(Field), Field.Write_text),
            (typeof(Field), Field.Download_asset),
            (typeof(TransferItem), TransferItem.Codename)
        };

        public Type GetType(string codename)
        {
            return codenames.First(pair => pair.codename == codename).type;
        }

        public string GetCodename(Type type)
        {
            return codenames.First(pair => pair.type == type).codename;
        }
    }
}