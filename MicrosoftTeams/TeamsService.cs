using Core;

using MicrosoftTeams.Models;

using System;
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

            card = card ?? throw new ArgumentNullException(nameof(card));

            channel ??= CoreHelper.GetSetting("Teams", "Default", "Channel");
            var requestUri = CoreHelper.GetSetting("Teams", "Channel", channel ?? "");

            var content = new StringContent(CoreHelper.Serialize(card));
            var response = await httpClient.PostAsync(requestUri, content);

            response.EnsureSuccessStatusCode();
        }
    }
}