using Microsoft.AspNetCore.Mvc;

using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace Functions
{
    public class ProxyResult : IActionResult
    {
        private readonly HttpResponseMessage responseMessage;

        public ProxyResult(HttpResponseMessage responseMessage)
        {
            this.responseMessage = responseMessage;
        }

        public async Task ExecuteResultAsync(ActionContext context)
        {
            context.HttpContext.Response.StatusCode = (int)responseMessage.StatusCode;

            foreach (var header in responseMessage.Headers)
            {
                context.HttpContext.Response.Headers[header.Key] = header.Value.ToArray();
            }

            foreach (var header in responseMessage.Content.Headers)
            {
                context.HttpContext.Response.Headers[header.Key] = header.Value.ToArray();
            }

            context.HttpContext.Response.Headers.Remove("transfer-encoding");

            await responseMessage.Content.CopyToAsync(context.HttpContext.Response.Body);
        }
    }
}