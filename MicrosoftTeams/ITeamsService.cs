using MicrosoftTeams.Models;

using System.Threading.Tasks;

namespace MicrosoftTeams
{
    public interface ITeamsService
    {
        Task PostMessage(PostMessageParameters postMessageParameters);
    }
}