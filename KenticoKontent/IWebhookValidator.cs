using KenticoKontent.Models.Webhook;

using System;
using System.Collections.Generic;

namespace KenticoKontent
{
    public interface IWebhookValidator
    {
        (bool valid, Func<Webhook> getWebhook) ValidateWebhook(string body, IDictionary<string, string> headers, string region);
    }
}