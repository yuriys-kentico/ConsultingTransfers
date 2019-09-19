using System;
using System.Threading.Tasks;

using Functions.Models;

using Microsoft.AspNetCore.Http;

namespace Functions.Webhooks
{
    public interface IWebhookValidator
    {
        Task<(bool valid, Func<Webhook> getWebhook)> ValidateWebhook(HttpRequest request, string identifier);
    }
}