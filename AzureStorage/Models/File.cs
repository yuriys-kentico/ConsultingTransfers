using System;

namespace AzureStorage.Models
{
    public class File
    {
        public string Url { get; set; } = null!;

        public string Name { get; set; } = null!;

        public long SizeBytes { get; set; }

        public DateTimeOffset? Created { get; set; }

        public DateTimeOffset? Modified { get; set; }

        public string GetMarkdownUrl() => $"[{Name}]({Url.Replace(" ", "%20")})";
    }
}