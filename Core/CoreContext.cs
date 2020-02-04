using System;
using System.Collections.Generic;
using System.Linq;

namespace Core
{
    public class CoreContext : ICoreContext
    {
        private string? region;
        private string? localization;

        public string Region
        {
            get => region ?? throw new ArgumentNullException(nameof(Region));
            set => region = Regions.Contains(value)
                ? value
                : throw new ArgumentOutOfRangeException($"Region '{value}' not valid.");
        }

        public IEnumerable<string> Regions
            => CoreHelper.GetSetting<string>(nameof(Regions)).Split(';', StringSplitOptions.RemoveEmptyEntries);

        public string Localization
        {
            get => localization ?? CoreHelper.GetSetting<string>(Region, "Default", nameof(Localization));
            set => localization = value;
        }
    }
}