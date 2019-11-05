using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using Authorization;
using Authorization.Models;

using Core;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;

using Transfers;
using Transfers.Models;

namespace Functions
{
    public class ListTransfers : AbstractFunction
    {
        private readonly IAccessTokenValidator accessTokenValidator;
        private readonly ITransfersService transfersService;

        public ListTransfers(IAccessTokenValidator accessTokenValidator, ITransfersService transfersService)
        {
            this.accessTokenValidator = accessTokenValidator;
            this.transfersService = transfersService;
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
                var tokenResult = await accessTokenValidator.ValidateTokenAsync(headers);

                switch (tokenResult)
                {
                    case ValidAccessTokenResult _:
                        var regions = string.IsNullOrWhiteSpace(specificRegion)
                            ? CoreHelper.GetSetting("regions").Split(';', StringSplitOptions.RemoveEmptyEntries)
                            : new[] { specificRegion };

                        List<Transfer> transfers = new List<Transfer>();

                        foreach (var region in regions)
                        {
                            transfers.AddRange(await transfersService.ListTransfers(region));
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