namespace VibeCheck.Server.DTO
{
    public class RecommendationPostDTO
    {
        public int ChannelId { get; set; }

        public string ExternalId { get; set; } = string.Empty;

        public string Source { get; set; } = string.Empty; // "Spotify" / "TMDb"
    }
}