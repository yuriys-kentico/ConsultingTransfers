using System.Net.Http;
using System.Threading.Tasks;

using Core;

using Newtonsoft.Json;

using Teams.Models;

namespace Teams
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

            var requestUri = CoreHelper.GetSetting("teams", "channel", channel);

            var content = new StringContent(JsonConvert.SerializeObject(card));
            var response = await httpClient.PostAsync(requestUri, content);

            response.EnsureSuccessStatusCode();
        }
    }
}