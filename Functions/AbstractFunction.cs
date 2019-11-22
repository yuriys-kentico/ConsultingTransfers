using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

using System;

namespace Functions
{
    public abstract class AbstractFunction
    {
        protected const string transfers = nameof(transfers);
        protected const string webhook = nameof(webhook);

        protected static IActionResult LogOk(ILogger log)
        {
            log.LogInformation("Ok");

            return new OkResult();
        }

        protected static IActionResult LogOkObject(ILogger log, object? response)
        {
            log.LogInformation("Ok object");

            return new OkObjectResult(response);
        }

        protected static IActionResult LogUnauthorized(ILogger log)
        {
            log.LogWarning("Unauthorized");

            return new UnauthorizedResult();
        }

        protected static IActionResult LogException(ILogger log, Exception ex)
        {
            var message = ex.Message;

            log.LogError(ex, "Error request: {message}", message);

            return new NotFoundResult();
        }
    }
}