using Authorization.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

using System;
using System.Net;
using System.Net.Http;
using System.Web.Http;

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
            logger.LogInformation("Ok object");

            return new OkObjectResult(response);
        }

        protected IActionResult LogUnauthorized()
        {
            logger.LogWarning("Unauthorized");

            return new UnauthorizedResult();
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