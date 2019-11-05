using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using Authorization;
using Authorization.Models;

using Functions.Models;

using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;

using Transfers;
using Transfers.Models;

namespace Functions
{
    public class CreateTransfer : AbstractFunction
    {
        private readonly IAccessTokenValidator accessTokenValidator;
        private readonly ITransfersService transfersService;

        public CreateTransfer(IAccessTokenValidator accessTokenValidator, ITransfersService transfersService)
        {
            this.accessTokenValidator = accessTokenValidator;
            this.transfersService = transfersService;
        }

        [FunctionName(nameof(CreateTransfer))]
        public async Task<IActionResult> Run(
            [HttpTrigger(
                AuthorizationLevel.Function,
                "post",
                Route = transfers + "/create/{region:alpha:length(2)}"
            )] CreateTransferRequest createTransferRequest,
            IDictionary<string, string> headers,
            string region,
            ILogger log
            )
        {
            try
            {
                var tokenResult = await accessTokenValidator.ValidateTokenAsync(headers);

                switch (tokenResult)
                {
                    case ValidAccessTokenResult _:
                        var (name, customer, requester, template, localization) = createTransferRequest;

                        var transfer = await transfersService.CreateTransfer(new CreateTransferParameters
                        {
                            Region = region,
                            Name = name,
                            Customer = customer,
                            Requester = requester,
                            TemplateItemCodename = template,
                            Localization = localization
                        });

                        return LogOkObject(log, transfer);

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