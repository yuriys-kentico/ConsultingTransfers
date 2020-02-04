using Microsoft.Bot.Schema.Teams;

using System;

namespace MicrosoftTeams.Models
{
    public class PostMessageParameters
    {
        public string? Channel { private get; set; }

        public O365ConnectorCard? Card { private get; set; }

        public void Deconstruct(
            out string? channel,
            out O365ConnectorCard card
            )
        {
            channel = Channel;
            card = Card ?? throw new ArgumentNullException(nameof(Card));
        }
    }
}