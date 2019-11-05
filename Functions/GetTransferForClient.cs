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
    public class GetTransferForClient : AbstractFunction
    {
        private readonly IAccessTokenValidator accessTokenValidator;
        private readonly ITransfersService transfersService;

        public GetTransferForClient(
            IAccessTokenValidator accessTokenValidator,
            ITransfersService transfersService
            )
        {
            this.accessTokenValidator = accessTokenValidator;
            this.transfersService = transfersService;
        }

        [FunctionName(nameof(GetTransferForClient))]
        public async Task<IActionResult> Run(
            [HttpTrigger(
                AuthorizationLevel.Function,
                "post",
                Route = transfers + "/client/get"
            )] GetTransferRequest getTransferRequest,
            IDictionary<string, string> headers,
            ILogger log
            )
        {
            try
            {
                var tokenResult = await accessTokenValidator.ValidateTokenAsync(headers);

                switch (tokenResult)
                {
                    case ValidAccessTokenResult _:
                    case NoAccessTokenResult _:
                        var (region, codename) = transfersService.DecryptTransferToken(getTransferRequest.TransferToken);

                        var transfer = await transfersService.GetTransferForClient(new GetTransferParameters
                        {
                            Region = region,
                            Codename = codename,
                            AccessTokenResult = tokenResult
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