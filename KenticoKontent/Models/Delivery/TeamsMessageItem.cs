using System.Text.RegularExpressions;

using Kentico.Kontent.Delivery;

namespace KenticoKontent.Models.Delivery
{
    public class TeamsMessageItem
    {
        public const string Codename = "teams_message";

        public ContentItemSystemAttributes System { get; set; }

        public string CardJSON { get; set; }

        public string GetCardJson()
        {
            return Regex.Replace(CardJSON, "<.*?>|\n|&nbsp;", string.Empty);
        }
    }
}