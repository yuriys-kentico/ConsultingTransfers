using Authorization;
using Authorization.Models;

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
    public class SuspendTransfer : BaseFunction
    {
        private readonly IAccessTokenValidator accessTokenValidator;
        private readonly ITransfersService transfersService;

        public SuspendTransfer(
            ILogger<SuspendTransfer> logger,
            IAccessTokenValidator accessTokenValidator,
            ITransfersService transfersService
            ) : base(logger)
        {
            this.accessTokenValidator = accessTokenValidator;
            this.transfersService = transfersService;
        }

        [FunctionName(nameof(SuspendTransfer))]
        public async Task<IActionResult> Run(
            [HttpTrigger(
                AuthorizationLevel.Function,
                "post",
                Route = transfers + "/suspend"
            )] GetTransferRequest getTransferRequest,
            IDictionary<string, string> headers
            )
        {
            try
            {
                AccessTokenResult = await accessTokenValidator.ValidateToken(headers);

                switch (AccessTokenResult)
                {
                    case ValidAccessTokenResult _:
                        await transfersService.SuspendTransfer(new GetTransferParameters
                        {
                            TransferToken = getTransferRequest.TransferToken
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