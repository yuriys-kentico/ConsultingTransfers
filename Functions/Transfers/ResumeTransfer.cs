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
    public class ResumeTransfer : AbstractFunction
    {
        private readonly IAccessTokenValidator accessTokenValidator;
        private readonly ITransfersService transfersService;

        public ResumeTransfer(
            IAccessTokenValidator accessTokenValidator,
            ITransfersService transfersService
            )
        {
            this.accessTokenValidator = accessTokenValidator;
            this.transfersService = transfersService;
        }

        [FunctionName(nameof(ResumeTransfer))]
        public async Task<IActionResult> Run(
            [HttpTrigger(
                AuthorizationLevel.Function,
                "post",
                Route = transfers + "/resume"
            )] GetTransferRequest getTransferRequest,
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
                        await transfersService.ResumeTransfer(new GetTransferParameters
                        {
                            TransferToken = getTransferRequest.TransferToken
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