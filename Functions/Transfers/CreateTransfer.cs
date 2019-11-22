using Authorization;
using Authorization.Models;

using Core;

using Functions.Models;

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
    public class CreateTransfer : AbstractFunction
    {
        private readonly IAccessTokenValidator accessTokenValidator;
        private readonly ITransfersService transfersService;
        private readonly ICoreContext coreContext;

        public CreateTransfer(
            IAccessTokenValidator accessTokenValidator,
            ITransfersService transfersService,
            ICoreContext coreContext
            )
        {
            this.accessTokenValidator = accessTokenValidator;
            this.transfersService = transfersService;
            this.coreContext = coreContext;
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
                coreContext.Region = region;

                var tokenResult = await accessTokenValidator.ValidateToken(headers);

                switch (tokenResult)
                {
                    case ValidAccessTokenResult _:
                        var (name, customer, requester, template, localization) = createTransferRequest;

                        coreContext.Localization = localization;

                        var transfer = await transfersService.CreateTransfer(new CreateTransferParameters
                        {
                            Name = name,
                            Customer = customer,
                            Requester = requester,
                            TemplateItemCodename = template
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