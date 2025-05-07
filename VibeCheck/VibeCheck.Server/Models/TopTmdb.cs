using System.ComponentModel.DataAnnotations;
using VibeCheck.Server.Models;

namespace VibeCheck.Server.Models
{
    public class TopTmdb
    {
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; }

        [Required]
        public int TmdbId { get; set; } // ID numeric de la TMDB

        [Range(1, 5)]
        public int Position { get; set; }

        [Required]
        public string MediaType { get; set; } = string.Empty; // "movie" sau "tv"

        public virtual ApplicationUser? User { get; set; }
    }
}