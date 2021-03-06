using Authorization;
using Authorization.Models;

using Core;

using Functions.Models;

using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Logging;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using Transfers;
using Transfers.Models;

namespace Functions.Transfers
{
    public class CreateTransfer : BaseFunction
    {
        private readonly IAccessTokenValidator accessTokenValidator;
        private readonly ITransfersService transfersService;
        private readonly ICoreContext coreContext;

        public CreateTransfer(
            ILogger<CreateTransfer> logger,
            IAccessTokenValidator accessTokenValidator,
            ITransfersService transfersService,
            ICoreContext coreContext
            ) : base(logger)
        {
            this.accessTokenValidator = accessTokenValidator;
            this.transfersService = transfersService;
            this.coreContext = coreContext;
        }

        [FunctionName(nameof(CreateTransfer))]
        public async Task<IActionResult> Run(
            [HttpTrigger(
                "post",
                Route = Routes.CreateTransfer
            )] CreateTransferRequest createTransferRequest,
            IDictionary<string, string> headers,
            string region
            )
        {
            try
            {
                coreContext.SetRegion(region);

                AccessTokenResult = await accessTokenValidator.ValidateToken(headers);

                switch (AccessTokenResult)
                {
                    case ValidAccessTokenResult _:
                        var (name, customer, template, localization) = createTransferRequest;

                        if (localization != null)
                        {
                            coreContext.Localization = localization;
                        }

                        var transfer = await transfersService.CreateTransfer(new CreateTransferParameters
                        {
                            Name = name,
                            Customer = customer,
                            TemplateItemCodename = template
                        });

                        return LogOkObject(transfer);

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