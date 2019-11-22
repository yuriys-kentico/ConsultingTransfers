using KenticoKontent.Models.ContentManagement.Elements;

using System.Collections.Generic;

namespace KenticoKontent.Models.ContentManagement
{
    public class LanguageVariant
    {
        public IList<AbstractElement> Elements { get; set; } = new List<AbstractElement>();
    }
}