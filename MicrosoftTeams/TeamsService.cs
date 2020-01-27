using Core;

using MicrosoftTeams.Models;

using System.Net.Http;
using System.Threading.Tasks;

namespace MicrosoftTeams
{
    public class TeamsService : ITeamsService
    {
        private readonly HttpClient httpClient;

        public TeamsService(HttpClient httpClient)
        {
            this.httpClient = httpClient;
        }

        public async Task PostMessage(PostMessageParameters postMessageParameters)
        {
            var (channel, card) = postMessageParameters;

            channel ??= CoreHelper.GetSetting<string>("MicrosoftTeams", "Default", "Channel");
            var requestUri = CoreHelper.GetSetting<string>("MicrosoftTeams", "Channel", channel ?? "");

            var content = new StringContent(CoreHelper.Serialize(card));
            var response = await httpClient.PostAsync(requestUri, content);

            response.EnsureSuccessStatusCode();
        }
    }
}