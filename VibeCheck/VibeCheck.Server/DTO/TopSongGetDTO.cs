namespace VibeCheck.Server.DTO;

public class TopSongGetDTO
{
    public int Position { get; set; }
    public string SpotifyTrackId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Artist { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
}