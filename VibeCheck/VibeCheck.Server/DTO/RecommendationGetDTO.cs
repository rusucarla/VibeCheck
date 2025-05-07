namespace VibeCheck.Server.DTO
{
    public class RecommendationGetDTO
    {
        public int Id { get; set; }

        public string Source { get; set; } = string.Empty;

        public string ExternalId { get; set; } = string.Empty;

        public string Title { get; set; } = string.Empty;

        public string? Subtitle { get; set; } // artist / tip film

        public string? ImageUrl { get; set; }

        public string ExternalUrl { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
    }
}