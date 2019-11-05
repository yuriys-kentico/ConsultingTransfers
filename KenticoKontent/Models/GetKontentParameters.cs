namespace KenticoKontent.Models
{
    public class GetKontentParameters
    {
        public string Region { get; set; }

        public string Codename { get; set; }

        public string Localization { get; set; } = "en-US";

        public void Deconstruct(out string region, out string codename, out string localization)
        {
            region = Region;
            codename = Codename;
            localization = Localization;
        }
    }
}