using System.ComponentModel.DataAnnotations;
using VibeCheck.Models;

namespace VibeCheck.Server.Models
{
    public class TopSong
    {
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; }

        [Required]
        public string SpotifyTrackId { get; set; }

        [Range(1, 5)]
        public int Position { get; set; }

        public virtual ApplicationUser? User { get; set; }
    }
}