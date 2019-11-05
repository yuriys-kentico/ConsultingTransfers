using Microsoft.Bot.Schema.Teams;

namespace Teams.Models
{
    public class PostMessageParameters
    {
        public string Channel { get; set; } = "transfers";

        public O365ConnectorCard Card { get; set; }

        public void Deconstruct(out string channel, out O365ConnectorCard card)
        {
            channel = Channel;
            card = Card;
        }
    }
}