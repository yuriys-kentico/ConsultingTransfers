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
    public class GetTransfer : AbstractFunction
    {
        private readonly IAccessTokenValidator accessTokenValidator;
        private readonly ITransfersService transfersService;
        private readonly ICoreContext coreContext;

        public GetTransfer(
            IAccessTokenValidator accessTokenValidator,
            ITransfersService transfersService,
            ICoreContext coreContext
            )
        {
            this.accessTokenValidator = accessTokenValidator;
            this.transfersService = transfersService;
            this.coreContext = coreContext;
        }

        [FunctionName(nameof(GetTransfer))]
        public async Task<IActionResult> Run(
            [HttpTrigger(
                AuthorizationLevel.Function,
                "post",
                Route = transfers + "/get"
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
                    case NoAccessTokenResult _:
                        var (transferToken, files, fields, containerUrl) = getTransferRequest;

                        var transfer = await transfersService.GetTransfer(new GetTransferParameters
                        {
                            TransferToken = transferToken,
                            Files = files,
                            Fields = fields,
                            ContainerUrl = containerUrl,
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