using System.ComponentModel.DataAnnotations;

namespace VibeCheck.Server.DTO;

public class TopSongPostDTO
{
    public string SpotifyTrackId { get; set; } = string.Empty;

    [Range(1, 5)]
    public int Position { get; set; }
}