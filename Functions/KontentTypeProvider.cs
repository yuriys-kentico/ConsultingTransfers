using System;
using System.Collections.Generic;
using System.Linq;

using Functions.Models;

using KenticoCloud.Delivery;

namespace Functions
{
    public class KontentTypeProvider : ITypeProvider
    {
        private static readonly Dictionary<Type, string> codenames = new Dictionary<Type, string>
        {
            {typeof(Field), Field.Codename},
            {typeof(Request), Request.Codename}
        };

        public Type GetType(string contentType)
        {
            return codenames.Keys.First(type => GetCodename(type).Equals(contentType));
        }

        public string GetCodename(Type contentType)
        {
            codenames.TryGetValue(contentType, out var codename);

            return codename;
        }
    }
}