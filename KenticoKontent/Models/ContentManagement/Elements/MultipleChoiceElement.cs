using System.Collections.Generic;

namespace KenticoKontent.Models.ContentManagement.Elements
{
    public class MultipleChoiceElement : AbstractElement
    {
        public IEnumerable<Reference>? Value { get; set; }
    }
}