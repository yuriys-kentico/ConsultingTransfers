using System;

using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Functions
{
    public abstract class AbstractFunction
    {
        protected const string transfers = "transfers";

        protected IActionResult LogOk(ILogger log)
        {
            log.LogInformation("Ok");

            return new OkResult();
        }

        protected IActionResult LogOkObject(ILogger log, object response)
        {
            log.LogInformation("Ok object");

            return new OkObjectResult(response);
        }

        protected IActionResult LogUnauthorized(ILogger log)
        {
            log.LogWarning("Unauthorized");

            return new UnauthorizedResult();
        }

        protected IActionResult LogException(ILogger log, Exception ex)
        {
            var message = ex.Message;

            log.LogError(ex, "Error request: {message}", message);

            return new NotFoundResult();
        }
    }
}