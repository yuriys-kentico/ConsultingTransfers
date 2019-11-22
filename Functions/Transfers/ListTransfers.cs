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
    public class ListTransfers : AbstractFunction
    {
        private readonly IAccessTokenValidator accessTokenValidator;
        private readonly ITransfersService transfersService;
        private readonly ICoreContext coreContext;

        public ListTransfers(
            IAccessTokenValidator accessTokenValidator,
            ITransfersService transfersService,
            ICoreContext coreContext
            )
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
                    Route = transfers + "/list/{specificRegion:alpha:length(2)?}"
                )] HttpRequest request,
                IDictionary<string, string> headers,
                string specificRegion,
                ILogger log
                )
        {
            try
            {
                var tokenResult = await accessTokenValidator.ValidateToken(headers);

                switch (tokenResult)
                {
                    case ValidAccessTokenResult _:
                        var regions = !string.IsNullOrWhiteSpace(specificRegion)
                            ? new[] { specificRegion }
                            : coreContext.Regions;

                        List<Transfer> transfers = new List<Transfer>();

                        if (regions == null)
                        {
                            throw new ArgumentNullException(nameof(regions));
                        }

                        foreach (var region in regions)
                        {
                            coreContext.Region = region;

                            transfers.AddRange(await transfersService.ListTransfers());
                        }

                        return LogOkObject(log, transfers);

                    default:
                        return LogUnauthorized(log);
                }
            }
            catch (Exception ex)
            {
                return LogException(log, ex);
            }
        }
    }
}