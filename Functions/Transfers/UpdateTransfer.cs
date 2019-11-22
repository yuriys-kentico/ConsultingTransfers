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
    public class UpdateTransfer : AbstractFunction
    {
        private readonly IAccessTokenValidator accessTokenValidator;
        private readonly ITransfersService transfersService;
        private readonly ICoreContext coreContext;

        public UpdateTransfer(
            IAccessTokenValidator accessTokenValidator,
            ITransfersService transfersService,
            ICoreContext coreContext
            )
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
            IDictionary<string, string> headers,
            ILogger log
            )
        {
            try
            {
                var tokenResult = await accessTokenValidator.ValidateToken(headers);

                switch (tokenResult)
                {
                    case ValidAccessTokenResult _:
                    case NoAccessTokenResult _:
                        var (transferToken, field, type, messageItemCodename, localization) = updateTransferRequest;

                        coreContext.Localization = localization;

                        var updateType = Enum.Parse<UpdateType>(type ?? "", true);

                        await transfersService.UpdateTransfer(new UpdateTransferParameters
                        {
                            TransferToken = transferToken,
                            Field = field,
                            Type = updateType,
                            MessageItemCodename = messageItemCodename
                        });

                        return LogOk(log);

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