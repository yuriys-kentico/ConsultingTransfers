using KenticoKontent.Models.ContentManagement.Elements;

using System;
using System.Collections.Generic;

namespace KenticoKontent.Models.ContentManagement.Components
{
    public abstract class AbstractComponent
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Reference Type { get; set; }

        public IList<AbstractElement>? Elements { get; set; }

        protected AbstractComponent(ResolvedField field)
        {
            Type = new Reference
            {
                Codename = field.Type
            };
        }
    }
}