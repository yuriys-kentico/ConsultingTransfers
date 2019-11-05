using System.Threading.Tasks;

using Teams.Models;

namespace Teams
{
    public interface ITeamsService
    {
        Task PostMessage(PostMessageParameters postMessageParameters);
    }
}