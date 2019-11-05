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
    public class UpdateTransfer : AbstractFunction
    {
        private readonly IAccessTokenValidator accessTokenValidator;
        private readonly ITransfersService transfersService;

        public UpdateTransfer(
            IAccessTokenValidator accessTokenValidator,
            ITransfersService transfersService
            )
        {
            this.accessTokenValidator = accessTokenValidator;
            this.transfersService = transfersService;
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
                var tokenResult = await accessTokenValidator.ValidateTokenAsync(headers);

                switch (tokenResult)
                {
                    case ValidAccessTokenResult _:
                    case NoAccessTokenResult _:
                        var (transferToken, fieldName, messageItemCodename) = updateTransferRequest;

                        var (region, codename) = transfersService.DecryptTransferToken(transferToken);

                        await transfersService.UpdateTransfer(new UpdateTransferParameters
                        {
                            Region = region,
                            Codename = codename,
                            TransferToken = transferToken,
                            FieldName = fieldName,
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