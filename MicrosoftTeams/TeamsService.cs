using Core;

using MicrosoftTeams.Models;

using System.Net.Http;
using System.Threading.Tasks;

namespace MicrosoftTeams
{
    public class TeamsService : ITeamsService
    {
        private readonly HttpClient httpClient;
        private readonly Settings settings;

        public TeamsService(
            HttpClient httpClient,
            Settings settings
            )
        {
            this.httpClient = httpClient;
            this.settings = settings;
        }

        public async Task PostMessage(PostMessageParameters postMessageParameters)
        {
            var (channel, card) = postMessageParameters;

            string requestUri = channel switch
            {
                _ => settings.MicrosoftTeams.Channels.Transfers,
            };

            var content = new StringContent(CoreHelper.Serialize(card));
            var response = await httpClient.PostAsync(requestUri, content);

            response.EnsureSuccessStatusCode();
        }
    }
}