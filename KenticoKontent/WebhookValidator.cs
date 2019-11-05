using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;

using Core;

using KenticoKontent.Models.Webhook;

using Newtonsoft.Json;

namespace KenticoKontent
{
    public class WebhookValidator : IWebhookValidator
    {
        private const string WebhookSignatureHeaderName = "X-Kc-Signature";

        public (bool valid, Func<Webhook> getWebhook) ValidateWebhook(string body, IDictionary<string, string> headers, string region)
        {
            headers.TryGetValue(WebhookSignatureHeaderName, out var signatureFromRequest);

            var secret = CoreHelper.GetSetting(region, "webhookSecret");
            var generatedSignature = GetHashForWebhook(body, secret);

            return (generatedSignature == signatureFromRequest, () => JsonConvert.DeserializeObject<Webhook>(body));
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