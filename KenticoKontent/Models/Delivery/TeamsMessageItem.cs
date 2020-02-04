using Kentico.Kontent.Delivery;

using System.Text.RegularExpressions;

namespace KenticoKontent.Models.Delivery
{
    public class TeamsMessageItem
    {
        public const string Codename = "teams_message";

        public ContentItemSystemAttributes System { get; set; } = default!;

        public string? CardJSON { get; set; }

        public string GetCardJson()
        {
            return Regex.Replace(CardJSON, "<.*?>|\n|&nbsp;", string.Empty);
        }
    }
}