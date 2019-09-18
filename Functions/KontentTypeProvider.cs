using System;
using System.Collections.Generic;
using System.Linq;

using Functions.Models;

using KenticoCloud.Delivery;

namespace Functions
{
    public class KontentTypeProvider : ITypeProvider
    {
        private static readonly IEnumerable<(Type type, string codename)> codenames = new HashSet<(Type, string)>
        {
            (typeof(Field), Field.Upload_file),
            (typeof(Field), Field.Write_text),
            (typeof(Field), Field.Download_asset),
            (typeof(Request), Request.Codename)
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