using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Authorization.Models;

using AzureStorage;
using AzureStorage.Models;

using Encryption;
using Encryption.Models;

using KenticoKontent;
using KenticoKontent.Models;
using KenticoKontent.Models.Delivery;

using Microsoft.Bot.Schema.Teams;

using Newtonsoft.Json;

using Teams;
using Teams.Models;

using Transfers.Models;

namespace Transfers
{
    public class TransfersService : ITransfersService
    {
        private readonly IEncryptionService encryptionService;
        private readonly IStorageService storageService;
        private readonly IKontentService kontentService;
        private readonly ITeamsService teamsService;

        public TransfersService(
            IEncryptionService encryptionService,
            IKontentService kontentService,
            IStorageService storageService,
            ITeamsService teamsService
            )
        {
            this.encryptionService = encryptionService;
            this.kontentService = kontentService;
            this.storageService = storageService;
            this.teamsService = teamsService;
        }

        public TransferToken DecryptTransferToken(string transferToken)
        {
            var transferTokenJson = encryptionService.Decrypt(transferToken);
            return JsonConvert.DeserializeObject<TransferToken>(transferTokenJson);
        }

        public async Task<Transfer> CreateTransfer(CreateTransferParameters createTransferParameters)
        {
            var (region, name, customer, requester, templateItemCodename, localization) = createTransferParameters;

            TemplateItem templateItem = null;

            if (!string.IsNullOrWhiteSpace(templateItemCodename))
            {
                templateItem = await kontentService.GetKontentItem<TemplateItem>(new GetKontentParameters
                {
                    Region = region,
                    Codename = templateItemCodename,
                    Localization = localization
                });
            }

            var transferItem = await kontentService.CreateTransfer(new CreateTransferItemParameters
            {
                Region = region,
                Name = name,
                Customer = customer,
                Requester = requester,
                Fields = templateItem?.GetFields(),
                Localization = localization
            });

            var containerName = storageService.GetSafeContainerName(transferItem.System.Codename);

            var transferToken = await storageService.CreateContainer(new CreateContainerParameters
            {
                Region = region,
                ContainerName = containerName,
                TransferToken = new TransferToken
                {
                    Region = region,
                    Codename = transferItem.System.Codename
                }
            });

            TemplateItem resolvedTemplateItem = null;

            if (!string.IsNullOrWhiteSpace(templateItemCodename))
            {
                resolvedTemplateItem = kontentService.ResolveItem(templateItem, new
                {
                    TransferName = transferItem.System.Name,
                    TransferPublicUrl = Transfer.GetUrl(transferToken)
                },
                nameof(TemplateItem.Message));
            }

            return new Transfer
            {
                Region = region,
                Name = transferItem.System.Name,
                Customer = transferItem.GetInfo().Customer,
                Requester = transferItem.GetInfo().Requester,
                TransferToken = transferToken,
                Template = resolvedTemplateItem?.Message
            };
        }

        public async Task<Transfer> GetTransfer(GetTransferParameters getTransferParameters)
        {
            var (region, codename, _) = getTransferParameters;

            var containerName = storageService.GetSafeContainerName(codename);

            var transferItem = await kontentService.GetKontentItem<TransferItem>(new GetKontentParameters
            {
                Region = region,
                Codename = codename
            });

            var files = await storageService.GetContainerFiles(new GetContainerParameters
            {
                Region = region,
                ContainerName = containerName
            });

            return new Transfer
            {
                Region = region,
                Name = transferItem.System.Name,
                Customer = transferItem.GetInfo().Customer,
                Requester = transferItem.GetInfo().Requester,
                Files = files
            };
        }

        public async Task<Transfer> GetTransferForClient(GetTransferParameters getTransferParameters)
        {
            var (region, codename, accessTokenResult) = getTransferParameters;

            var containerName = storageService.GetSafeContainerName(codename);

            string containerUrl = string.Empty;

            switch (accessTokenResult)
            {
                case ValidAccessTokenResult _:
                    containerUrl = storageService.GetAdminContainerUrl(new GetContainerParameters
                    {
                        Region = region,
                        ContainerName = containerName
                    });
                    break;

                case NoAccessTokenResult _:
                    containerUrl = storageService.GetPublicContainerUrl(new GetContainerParameters
                    {
                        Region = region,
                        ContainerName = containerName
                    });
                    break;
            }

            var transferItem = await kontentService.GetKontentItem<TransferItem>(new GetKontentParameters
            {
                Region = region,
                Codename = codename
            });

            return new Transfer
            {
                Region = region,
                Name = transferItem.System.Name,
                Customer = transferItem.GetInfo().Customer,
                Requester = transferItem.GetInfo().Requester,
                ContainerName = containerName,
                ContainerUrl = containerUrl,
                Fields = transferItem.GetFields()
            };
        }

        public async Task UpdateTransfer(UpdateTransferParameters updateTransferParameters)
        {
            var (region, codename, transferToken, fieldName, messageItemCodename) = updateTransferParameters;

            var teamsMessageItem = await kontentService.GetKontentItem<TeamsMessageItem>(new GetKontentParameters
            {
                Region = region,
                Codename = messageItemCodename
            });

            var transferItem = await kontentService.GetKontentItem<TransferItem>(new GetKontentParameters
            {
                Region = region,
                Codename = codename
            });

            var resolvedTeamsMessageItem = kontentService.ResolveItem(teamsMessageItem, new
            {
                TransferRegion = region.ToUpper(),
                TransferName = transferItem.System.Name,
                TransferCustomer = transferItem.GetInfo().Customer,
                TransferRequester = transferItem.GetInfo().Requester,
                TransferPublicUrl = $"[Caddy | {transferItem.System.Name}]({Transfer.GetUrl(transferToken)})",
                FieldName = fieldName,
            }, nameof(TeamsMessageItem.CardJSON));

            var card = JsonConvert.DeserializeObject<O365ConnectorCard>(resolvedTeamsMessageItem.GetCardJson());

            var containerName = storageService.GetSafeContainerName(codename);

            var files = await storageService.GetContainerFiles(new GetContainerParameters
            {
                Region = region,
                ContainerName = containerName
            });

            var completedFieldPaths = files
                .Where(filePair => filePair.Value.Name == "completed")
                .Select(filePair => filePair.Key.ToLower());

            var folderFields = transferItem
                .GetFields()
                .ToDictionary(field => storageService.GetSafePathSegment(field.Name), field => field);

            var completedFieldFacts = folderFields
                .Where(folderField => completedFieldPaths.Any(path => path.Contains(folderField.Key)))
                .Select(folderField => new O365ConnectorCardFact
                {
                    Name = folderField.Value.Name,
                    Value = string.Join(", ", files
                        .Where(filePair => filePair.Key.ToLower().Contains(folderField.Key))
                        .Where(filePair => filePair.Value.Name != "completed")
                        .Select(filePair => $"[{filePair.Value.Name}]({filePair.Value.Url.Replace(" ", "%20")})"))
                })
                .ToList();

            card.Sections[1].Facts = completedFieldFacts;

            await teamsService.PostMessage(new PostMessageParameters
            {
                Card = card
            });
        }

        public async Task<IEnumerable<Transfer>> ListTransfers(string region)
        {
            var transferItems = await kontentService.GetTransfers(region);

            IList<Transfer> transfers = new List<Transfer>();

            foreach (var transferItem in transferItems)
            {
                var containerName = storageService.GetSafeContainerName(transferItem.System.Codename);

                string transferToken = await storageService.GetContainerTransferToken(new GetContainerParameters
                {
                    Region = region,
                    ContainerName = containerName
                });

                if (!string.IsNullOrWhiteSpace(transferToken))
                {
                    transfers.Add(new Transfer
                    {
                        Region = region,
                        Name = transferItem.System.Name,
                        Codename = transferItem.System.Codename,
                        Customer = transferItem.GetInfo().Customer,
                        Requester = transferItem.GetInfo().Requester,
                        TransferToken = transferToken
                    });
                }
            }

            return transfers;
        }
    }
}