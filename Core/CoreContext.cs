using System;
using System.Collections.Generic;

namespace Core
{
    public class CoreContext : ICoreContext
    {
        private readonly Settings settings;

        private Region? region;
        private string? localization;

        public Region Region
        {
            get => region ?? throw new ArgumentNullException(nameof(Region));
            private set => region = value;
        }

        public IEnumerable<string> Regions => settings.Regions.Split(';', StringSplitOptions.RemoveEmptyEntries);

        public string Localization
        {
            get => localization ?? Region.DefaultLocalization;
            set => localization = value;
        }

        public CoreContext(
            Settings settings
            )
        {
            this.settings = settings;
        }

        public Region SetRegion(string region)
        {
            return region switch
            {
                "us" => Region = settings.Us,
                "eu" => Region = settings.Eu,
                _ => throw new ArgumentOutOfRangeException($"Region '{region}' not valid."),
            };
        }
    }
}