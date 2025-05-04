namespace VibeCheck.Server.DTO;

public class TopTmdbGetDTO
{
    public int TmdbId { get; set; }
    public string MediaType { get; set; } = string.Empty;
    public int Position { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? PosterUrl { get; set; }
}