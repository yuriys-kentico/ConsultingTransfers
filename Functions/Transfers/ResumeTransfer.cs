using Authorization;
using Authorization.Models;

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
    public class ResumeTransfer : BaseFunction
    {
        private readonly IAccessTokenValidator accessTokenValidator;
        private readonly ITransfersService transfersService;

        public ResumeTransfer(
            ILogger<ResumeTransfer> logger,
            IAccessTokenValidator accessTokenValidator,
            ITransfersService transfersService
            ) : base(logger)
        {
            this.accessTokenValidator = accessTokenValidator;
            this.transfersService = transfersService;
        }

        [FunctionName(nameof(ResumeTransfer))]
        public async Task<IActionResult> Run(
            [HttpTrigger(
                "post",
                Route = Routes.ResumeTransfer
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
                        var (transferToken, _, _, _) = getTransferRequest;

                        await transfersService.ResumeTransfer(new GetTransferParameters
                        {
                            TransferToken = transferToken
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