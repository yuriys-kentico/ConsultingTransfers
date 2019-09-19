using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

using Functions.Models;

using Microsoft.AspNetCore.Http;
using Microsoft.Azure.WebJobs.Extensions.Http;

namespace Functions.Webhooks
{
    public class WebhookValidator : IWebhookValidator
    {
        private const string WebhookSignatureHeaderName = "X-Kc-Signature";

        public async Task<(bool valid, Func<Webhook> getWebhook)> ValidateWebhook(HttpRequest request, string identifier)
        {
            request.Headers.TryGetValue(WebhookSignatureHeaderName, out var signatureFromRequest);

            var requestBody = await request.ReadAsStringAsync();

            var secret = AzureFunctionHelper.GetEnvironmentVariable(request.Query["accountName"], "webhookSecret", identifier);
            var generatedSignature = GetHashForWebhook(requestBody, secret);

            return (generatedSignature == signatureFromRequest, () => AzureFunctionHelper.GetPayload<Webhook>(requestBody));
        }

        private static string GetHashForWebhook(string content, string secret)
        {
            var safeUTF8 = new UTF8Encoding(false, true);
            byte[] keyBytes = safeUTF8.GetBytes(secret);
            byte[] messageBytes = safeUTF8.GetBytes(content);

            using (var hmacsha256 = new HMACSHA256(keyBytes))
            {
                byte[] hashMessage = hmacsha256.ComputeHash(messageBytes);

                return Convert.ToBase64String(hashMessage);
            }
        }
    }
}