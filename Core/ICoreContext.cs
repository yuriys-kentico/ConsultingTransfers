using System.Collections.Generic;

namespace Core
{
    public interface ICoreContext
    {
        string Region { get; set; }

        IEnumerable<string> Regions { get; }

        string Localization { get; set; }
    }
}