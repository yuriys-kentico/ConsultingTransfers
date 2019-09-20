using System;
using System.Threading.Tasks;

using KenticoKontent.Models;

using Microsoft.AspNetCore.Http;

namespace KenticoKontent
{
    public interface IWebhookValidator
    {
        Task<(bool valid, Func<Webhook> getWebhook)> ValidateWebhook(HttpRequest request, string identifier);
    }
}