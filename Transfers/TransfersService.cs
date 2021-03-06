﻿using Authorization.Models;

using AzureStorage;
using AzureStorage.Models;

using Core;

using KenticoKontent;
using KenticoKontent.Models;
using KenticoKontent.Models.Delivery;

using Microsoft.Bot.Schema.Teams;

using MicrosoftTeams;
using MicrosoftTeams.Models;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

using Transfers.Models;

namespace Transfers
{
    public class TransfersService : ITransfersService
    {
        private readonly IStorageRepository storageRepository;
        private readonly IKontentRepository kontentRepository;
        private readonly ITeamsService teamsService;
        private readonly ICoreContext coreContext;
        private readonly Settings settings;

        public TransfersService(
            IKontentRepository kontentRepository,
            IStorageRepository storageRepository,
            ITeamsService teamsService,
            ICoreContext coreContext,
            Settings settings
            )
        {
            this.kontentRepository = kontentRepository;
            this.storageRepository = storageRepository;
            this.teamsService = teamsService;
            this.coreContext = coreContext;
            this.settings = settings;
        }

        public async Task<Transfer> CreateTransfer(CreateTransferParameters createTransferParameters)
        {
            var (name, customer, templateItemCodename) = createTransferParameters;

            TemplateItem? templateItem = default;

            if (!string.IsNullOrWhiteSpace(templateItemCodename))
            {
                templateItem = await kontentRepository.GetKontentItem<TemplateItem>(new GetKontentParameters
                {
                    Codename = templateItemCodename
                });
            }

            var transferItem = await kontentRepository.CreateTransferItem(new CreateTransferItemParameters
            {
                Name = name,
                Customer = customer,
                Fields = templateItem?.GetFields(),
            });

            var container = await storageRepository.GetContainer(new GetContainerParameters
            {
                ContainerName = storageRepository.GetSafeContainerName(transferItem.System.Codename)
            });

            container.DeleteWhen = DateTime.MaxValue;

            container.TransferToken = storageRepository.EncryptTransferToken(new TransferToken
            {
                Codename = transferItem.System.Codename,
                Localization = transferItem.System.Language,
                Region = coreContext.Region.Name
            });

            await container.Update();

            TemplateItem? resolvedTemplateItem = default;

            if (!string.IsNullOrWhiteSpace(templateItemCodename) && templateItem != default)
            {
                resolvedTemplateItem = kontentRepository.ResolveItem(templateItem, new
                {
                    TransferName = transferItem.System.Name,
                    TransferUrl = $"{settings.Client.TransferUrl}{HttpUtility.UrlEncode(container.TransferToken)}",
                },
                nameof(TemplateItem.Message));
            }

            return new Transfer
            {
                Region = coreContext.Region.Name,
                Name = transferItem.System.Name,
                Customer = transferItem.GetInfo().Customer,
                TransferToken = container.TransferToken,
                Template = resolvedTemplateItem?.Message
            };
        }

        public async Task<Transfer?> GetTransfer(GetTransferParameters getTransferParameters)
        {
            var (transferToken, files, fields, containerUrl, accessTokenResult) = getTransferParameters;
            var (region, codename, _) = storageRepository.DecryptTransferToken(transferToken);

            var transferItem = await kontentRepository.GetKontentItem<TransferItem>(new GetKontentParameters
            {
                Codename = codename
            });

            if (transferItem == default)
            {
                return null;
            }

            var getContainerParameters = new GetContainerParameters
            {
                ContainerName = storageRepository.GetSafeContainerName(codename)
            };

            var container = await storageRepository.GetContainer(getContainerParameters);

            return (files, fields, containerUrl, accessTokenResult)
            switch
            {
                (false, true, true, _) when accessTokenResult is NoAccessTokenResult => new Transfer
                {
                    Region = coreContext.Region.Name,
                    Name = transferItem.System.Name,
                    Customer = transferItem.GetInfo().Customer,
                    ContainerUrl = storageRepository.GetPublicContainerUrl(getContainerParameters),
                    Fields = transferItem.GetFields(container.CompletedFields)
                },
                (false, true, true, _) when accessTokenResult is ValidAccessTokenResult => new Transfer
                {
                    Region = coreContext.Region.Name,
                    Name = transferItem.System.Name,
                    Codename = transferItem.System.Codename,
                    Customer = transferItem.GetInfo().Customer,
                    ContainerUrl = storageRepository.GetAdminContainerUrl(getContainerParameters),
                    Fields = transferItem.GetFields(container.CompletedFields)
                },
                (true, false, false, _) when accessTokenResult is ValidAccessTokenResult => new Transfer
                {
                    Region = region,
                    Name = transferItem.System.Name,
                    Customer = transferItem.GetInfo().Customer,
                    Files = await storageRepository.GetContainerFiles(new GetContainerParameters
                    {
                        ContainerName = storageRepository.GetSafeContainerName(codename)
                    })
                },
                _ => throw new ArgumentException($"Combination of files ({files}), fields ({fields}), containerUrl ({containerUrl}), and accessTokenResult ({accessTokenResult?.GetType().Name}) is not valid.")
            };
        }

        public async Task UpdateTransfer(UpdateTransferParameters updateTransferParameters)
        {
            var (transferToken, field, type, messageItemCodename) = updateTransferParameters;
            var (region, codename, localization) = storageRepository.DecryptTransferToken(transferToken);

            var container = await storageRepository.GetContainer(new GetContainerParameters
            {
                ContainerName = storageRepository.GetSafeContainerName(codename),
            });

            switch (type)
            {
                case UpdateType.FieldComplete:
                    if (field != default)
                    {
                        container.CompletedFields.Add(field);
                    }

                    await container.Update();
                    break;

                case UpdateType.FieldIncomplete:
                    if (field != default)
                    {
                        container.CompletedFields.Remove(field);
                    }

                    await container.Update();
                    return;
            }

            var transferItem = await kontentRepository.GetKontentItem<TransferItem>(new GetKontentParameters
            {
                Codename = codename
            });

            var teamsMessageItem = await kontentRepository.GetKontentItem<TeamsMessageItem>(new GetKontentParameters
            {
                Codename = messageItemCodename
            });

            var resolvedTeamsMessageItem = kontentRepository.ResolveItem(teamsMessageItem, new
            {
                TransferRegion = coreContext.Region.Name.ToUpper(),
                TransferName = transferItem.System.Name,
                TransferCustomer = transferItem.GetInfo().Customer,
                TransferUrl = $"{settings.Client.TransferUrl}{HttpUtility.UrlEncode(transferToken)}",
                settings.Client.TransfersUrl,
                Field = transferItem.GetFields(container.CompletedFields)
                    .Single(completedField => completedField.Codename == field).Name,
            }, nameof(TeamsMessageItem.CardJSON));

            var card = CoreHelper.Deserialize<O365ConnectorCard>(resolvedTeamsMessageItem.GetCardJson());

            var files = await storageRepository.GetContainerFiles(new GetContainerParameters
            {
                ContainerName = storageRepository.GetSafeContainerName(codename)
            });

            var completedFields = transferItem.GetFields(container.CompletedFields)
                .Where(field => field.Completed);

            var completedFieldFacts = completedFields
                .Select(field => new O365ConnectorCardFact
                {
                    Name = field.Name,
                    Value = string.Join(", ", files
                        .Where(filePair => filePair.Key.ToLower()
                            .Contains(storageRepository.GetSafePathSegment(field.Name)))
                        .Select(filePair => filePair.Value.GetMarkdownUrl())
                    )
                })
                .ToList();

            card.Sections[1].Facts = completedFieldFacts;

            await teamsService.PostMessage(new PostMessageParameters
            {
                Card = card
            });
        }

        public async Task SuspendTransfer(GetTransferParameters getTransferParameters)
        {
            var (transferToken, _, _, _, _) = getTransferParameters;
            var (_, codename, _) = storageRepository.DecryptTransferToken(transferToken);

            var getKontentItemParameters = new GetKontentParameters
            {
                Codename = codename
            };

            if (kontentRepository.GetKontentItem<Transfer>(getKontentItemParameters) != default)
            {
                await kontentRepository.UnpublishLanguageVariant(getKontentItemParameters);
            }
        }

        public async Task ResumeTransfer(GetTransferParameters getTransferParameters)
        {
            var (transferToken, _, _, _, _) = getTransferParameters;
            var (_, codename, _) = storageRepository.DecryptTransferToken(transferToken);

            await kontentRepository.PublishLanguageVariant(new GetKontentParameters
            {
                Codename = codename
            });
        }

        public async Task<IEnumerable<Transfer>> ListTransfers()
        {
            var transferItems = await kontentRepository.GetTransfers();

            IList<Transfer> transfers = new List<Transfer>();

            foreach (var transferItem in transferItems)
            {
                var container = await storageRepository.GetContainer(new GetContainerParameters
                {
                    ContainerName = storageRepository.GetSafeContainerName(transferItem.System.Codename)
                });

                if (!string.IsNullOrWhiteSpace(container.TransferToken))
                {
                    transfers.Add(new Transfer
                    {
                        Region = coreContext.Region.Name,
                        Name = transferItem.System.Name,
                        Codename = transferItem.System.Codename,
                        Customer = transferItem.GetInfo().Customer,
                        TransferToken = container.TransferToken
                    });
                }
            }

            return transfers;
        }
    }
}