using Authorization;
using Authorization.Models;

using Core;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using Transfers;
using Transfers.Models;

namespace Functions.Transfers
{
    public class ListTransfers : BaseFunction
    {
        private readonly IAccessTokenValidator accessTokenValidator;
        private readonly ITransfersService transfersService;
        private readonly ICoreContext coreContext;

        public ListTransfers(
            ILogger<ListTransfers> logger,
            IAccessTokenValidator accessTokenValidator,
            ITransfersService transfersService,
            ICoreContext coreContext
            ) : base(logger)
        {
            this.accessTokenValidator = accessTokenValidator;
            this.transfersService = transfersService;
            this.coreContext = coreContext;
        }

        [FunctionName(nameof(ListTransfers))]
        public async Task<IActionResult> Run(
                [HttpTrigger(
                    AuthorizationLevel.Function,
                    "post",
                    Route = Routes.ListTransfers
                )] HttpRequest request,
                IDictionary<string, string> headers,
                string specificRegion
                )
        {
            try
            {
                AccessTokenResult = await accessTokenValidator.ValidateToken(headers);

                switch (AccessTokenResult)
                {
                    case ValidAccessTokenResult _:
                        var regions = !string.IsNullOrWhiteSpace(specificRegion)
                            ? new[] { specificRegion }
                            : coreContext.Regions;

                        List<Transfer> transfers = new List<Transfer>();

                        if (regions == default)
                        {
                            throw new ArgumentNullException(nameof(regions));
                        }

                        foreach (var region in regions)
                        {
                            coreContext.Region = region;

                            transfers.AddRange(await transfersService.ListTransfers());
                        }

                        return LogOkObject(transfers);

                    default:
                        return LogUnauthorized();
                }
            }
            catch (Exception ex)
            {
                return LogException(ex);
            }
        }
    }
}