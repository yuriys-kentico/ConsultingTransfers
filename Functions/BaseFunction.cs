using Authorization.Models;

using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

using System;

namespace Functions
{
    public class BaseFunction
    {
        private readonly ILogger logger;

        protected const string transfers = nameof(transfers);
        protected const string webhook = nameof(webhook);

        public IAccessTokenResult? AccessTokenResult { get; protected set; }

        protected BaseFunction(ILogger logger)
        {
            this.logger = logger;
        }

        protected IActionResult LogOk()
        {
            logger.LogInformation("Ok");

            return new OkResult();
        }

        protected IActionResult LogOkObject(object? response)
        {
            logger.LogInformation("Ok object: {response}", response);

            return new OkObjectResult(response);
        }

        protected IActionResult LogUnauthorized()
        {
            logger.LogWarning("Unauthorized: {AccessTokenResult}", AccessTokenResult);

            return AccessTokenResult switch
            {
                ExpiredAccessTokenResult _ => new UnauthorizedResult(),
                _ => new NotFoundResult(),
            };
        }

        protected IActionResult LogException(Exception exception)
        {
            var message = exception.Message;

            logger.LogError(exception, "Error request: {message}", message);

            return AccessTokenResult switch
            {
                ValidAccessTokenResult _ => new InternalServerErrorMessageResult(exception.Message),
                _ => new NotFoundResult(),
            };
        }
    }
}