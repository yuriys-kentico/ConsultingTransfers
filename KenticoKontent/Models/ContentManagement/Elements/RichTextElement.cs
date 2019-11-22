using KenticoKontent.Models.ContentManagement.Components;

using System.Collections.Generic;

namespace KenticoKontent.Models.ContentManagement.Elements
{
    public class RichTextElement : AbstractElement
    {
        public string? Value { get; set; }

        public IList<AbstractComponent> Components { get; set; } = new List<AbstractComponent>();
    }
}