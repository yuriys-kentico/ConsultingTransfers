using Core;

using Microsoft.Azure.Storage.Blob;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AzureStorage.Models
{
    public class Container
    {
        private readonly CloudBlobContainer container;

        public Container(CloudBlobContainer container)
        {
            this.container = container;

            if (container.Metadata.TryGetValue(nameof(DeleteWhen), out var deleteWhenJson))
            {
                DeleteWhen = CoreHelper.Deserialize<DateTime>(deleteWhenJson);
            }

            if (container.Metadata.TryGetValue(nameof(TransferToken), out var transferTokenJson))
            {
                TransferToken = CoreHelper.Deserialize<string>(transferTokenJson);
            }

            if (container.Metadata.TryGetValue(nameof(CompletedFields), out var completedFieldsJson))
            {
                CompletedFields = CoreHelper.Deserialize<HashSet<string>>(completedFieldsJson);
            }
        }

        public DateTime DeleteWhen { get; set; }

        public string TransferToken { get; set; } = "";

        public ICollection<string> CompletedFields { get; } = new HashSet<string>();

        public async Task Update()
        {
            container.Metadata[nameof(DeleteWhen)] = CoreHelper.Serialize(DeleteWhen);
            container.Metadata[nameof(TransferToken)] = CoreHelper.Serialize(TransferToken);
            container.Metadata[nameof(CompletedFields)] = CoreHelper.Serialize(CompletedFields);

            await container.SetMetadataAsync();
        }

        public async Task Delete()
        {
            await container.DeleteAsync();
        }
    }
}