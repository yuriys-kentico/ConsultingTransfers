using System;

using Newtonsoft.Json;

namespace Functions.Models
{
    public class Webhook
    {
        public Message Message { get; set; }

        public Data Data { get; set; }
    }

    public class Message
    {
        public Guid Id { get; set; }

        public string Type { get; set; }

        public string Operation { get; set; }

        [JsonProperty("api_name")]
        public string ApiName { get; set; }

        [JsonProperty("project_id")]
        public Guid ProjectId { get; set; }
    }

    public class Data
    {
        public Item[] Items { get; set; }

        public Taxonomy[] Taxonomies { get; set; }
    }

    public class Item
    {
        public string Language { get; set; }

        public string Type { get; set; }

        public string Codename { get; set; }
    }

    public class Taxonomy
    {
        public string Codename { get; set; }
    }
}