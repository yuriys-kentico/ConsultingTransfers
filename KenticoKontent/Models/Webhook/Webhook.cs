using System;

using Newtonsoft.Json;

namespace KenticoKontent.Models.Webhook
{
    public class Webhook
    {
        public Data Data { get; set; }

        public Message Message { get; set; }

        public void Deconstruct(out Data data, out Message message)
        {
            data = Data;
            message = Message;
        }
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
}