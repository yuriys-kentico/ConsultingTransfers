using System;

namespace AzureStorage.Models
{
    public class File
    {
        public string Url { get; set; }

        public string Name { get; set; }

        public long SizeBytes { get; set; }

        public DateTimeOffset? Created { get; set; }

        public DateTimeOffset? Modified { get; set; }
    }
}