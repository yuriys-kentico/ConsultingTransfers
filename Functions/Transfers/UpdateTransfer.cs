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
    public class UpdateTransfer : BaseFunction
    {
        private readonly IAccessTokenValidator accessTokenValidator;
        private readonly ITransfersService transfersService;
        private readonly ICoreContext coreContext;

        public UpdateTransfer(
            ILogger<UpdateTransfer> logger,
            IAccessTokenValidator accessTokenValidator,
            ITransfersService transfersService,
            ICoreContext coreContext
            ) : base(logger)
        {
            this.accessTokenValidator = accessTokenValidator;
            this.transfersService = transfersService;
            this.coreContext = coreContext;
        }

        [FunctionName(nameof(UpdateTransfer))]
        public async Task<IActionResult> Run(
            [HttpTrigger(
                AuthorizationLevel.Function,
                "post",
                Route = transfers + "/update"
            )] UpdateTransferRequest updateTransferRequest,
            IDictionary<string, string> headers
            )
        {
            try
            {
                AccessTokenResult = await accessTokenValidator.ValidateToken(headers);

                switch (AccessTokenResult)
                {
                    case ValidAccessTokenResult _:
                    case NoAccessTokenResult _:
                        var (transferToken, field, type, messageItemCodename, localization) = updateTransferRequest;

                        if (localization != null)
                        {
                            coreContext.Localization = localization;
                        }

                        var updateType = Enum.Parse<UpdateType>(type ?? "", true);

                        await transfersService.UpdateTransfer(new UpdateTransferParameters
                        {
                            TransferToken = transferToken,
                            Field = field,
                            Type = updateType,
                            MessageItemCodename = messageItemCodename
                        });

                        return LogOk();

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