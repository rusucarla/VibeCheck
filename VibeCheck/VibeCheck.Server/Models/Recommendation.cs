using System.ComponentModel.DataAnnotations;

namespace VibeCheck.Server.Models
{
    public class Recommendation
    {
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; }

        [Required]
        public int ChannelId { get; set; }

        [Required]
        public string ExternalId { get; set; } = string.Empty; // Spotify track ID / TMDb ID

        [Required]
        public string Source { get; set; } = string.Empty; // "Spotify" / "TMDb"

        [Required]
        public string ExternalUrl { get; set; } = string.Empty; // Clickable link

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual ApplicationUser? User { get; set; }
        public virtual Channel? Channel { get; set; }
    }
}