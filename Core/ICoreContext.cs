using System.Collections.Generic;

namespace Core
{
    public interface ICoreContext
    {
        Region Region { get; }

        IEnumerable<string> Regions { get; }

        string Localization { get; set; }

        Region SetRegion(string region);
    }
}