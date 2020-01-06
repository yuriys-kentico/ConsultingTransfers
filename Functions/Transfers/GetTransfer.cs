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
    public class GetTransfer : BaseFunction
    {
        private readonly IAccessTokenValidator accessTokenValidator;
        private readonly ITransfersService transfersService;
        private readonly ICoreContext coreContext;

        public GetTransfer(
            ILogger<GetTransfer> logger,
            IAccessTokenValidator accessTokenValidator,
            ITransfersService transfersService,
            ICoreContext coreContext
            ) : base(logger)
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
                        var (transferToken, files, fields, containerUrl) = getTransferRequest;

                        var transfer = await transfersService.GetTransfer(new GetTransferParameters
                        {
                            TransferToken = transferToken,
                            Files = files,
                            Fields = fields,
                            ContainerUrl = containerUrl,
                            AccessTokenResult = AccessTokenResult
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