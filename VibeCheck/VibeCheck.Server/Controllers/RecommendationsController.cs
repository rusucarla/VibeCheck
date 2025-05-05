using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using VibeCheck.Server.Models;
using VibeCheck.Server.Data;
using VibeCheck.Server.DTO;
using VibeCheck.Server.Services;

namespace VibeCheck.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RecommendationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SpotifyService _spotifyService;
        private readonly TmdbService _tmdbService;

        public RecommendationsController(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            SpotifyService spotifyService,
            TmdbService tmdbService)
        {
            _context = context;
            _userManager = userManager;
            _spotifyService = spotifyService;
            _tmdbService = tmdbService;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] RecommendationPostDTO dto)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();
            
            var isMember = await _context.BindChannelUserEntries
                .AnyAsync(b => b.ChannelId == dto.ChannelId && b.UserId == user.Id);

            if (!isMember)
                return StatusCode(403, new { error = "You must be a member of this channel to recommend media." });
            
            var channel = await _context.Channels.FindAsync(dto.ChannelId);
            if (channel == null) return NotFound("Channel not found.");

            // Determinam link-ul in functie de sursa
            string? externalUrl = dto.Source switch
            {
                "Spotify" => $"https://open.spotify.com/track/{dto.ExternalId}",
                "TMDb"    => $"https://www.themoviedb.org/{await GetTmdbType(dto.ExternalId)}/{dto.ExternalId}",
                _         => null
            };

            if (externalUrl == null) return BadRequest("Unknown media source.");

            var recommendation = new Recommendation
            {
                UserId      = user.Id,
                ChannelId   = dto.ChannelId,
                ExternalId  = dto.ExternalId,
                Source      = dto.Source,
                ExternalUrl = externalUrl,
                CreatedAt   = DateTime.UtcNow
            };

            _context.Recommendations.Add(recommendation);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpGet("/api/channels/{channelId}/recommendations")]
        public async Task<ActionResult<IEnumerable<RecommendationGetDTO>>> GetByChannel(int channelId)
        {
            var recs = await _context.Recommendations
                .Where(r => r.ChannelId == channelId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            var result = new List<RecommendationGetDTO>();

            foreach (var r in recs)
            {
                if (r.Source == "Spotify")
                {
                    var track = await _spotifyService.GetTrackByIdAsync(r.ExternalId);
                    if (track == null) continue;

                    result.Add(new RecommendationGetDTO
                    {
                        Id          = r.Id,
                        Source      = r.Source,
                        ExternalId  = r.ExternalId,
                        Title       = track.Name ?? "",
                        Subtitle    = track.Artist ?? "",
                        ImageUrl    = track.ImageUrl,
                        ExternalUrl = r.ExternalUrl,
                        CreatedAt   = r.CreatedAt
                    });
                }
                else if (r.Source == "TMDb")
                {
                    // presupunem ca tipul (movie/tv) e inclus in URL; putem extrage din el
                    var mediaType = await GetTmdbType(r.ExternalId);
                    var media = await _tmdbService.GetByIdAsync(int.Parse(r.ExternalId), mediaType);
                    if (media == null) continue;

                    result.Add(new RecommendationGetDTO
                    {
                        Id          = r.Id,
                        Source      = r.Source,
                        ExternalId  = r.ExternalId,
                        Title       = media.Title,
                        Subtitle    = media.MediaType?.ToUpper(), // movie / tv
                        ImageUrl    = media.PosterUrl,
                        ExternalUrl = r.ExternalUrl,
                        CreatedAt   = r.CreatedAt
                    });
                }
            }

            return result;
        }

        private async Task<string> GetTmdbType(string externalId)
        {
            var id = int.Parse(externalId);
            var type = await _tmdbService.GetMediaTypeByIdAsync(id);
            return type ?? "movie"; // fallback
        }
        
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var rec = await _context.Recommendations.FindAsync(id);
            if (rec == null) return NotFound();

            var isAdmin = await _context.BindChannelUserEntries
                .AnyAsync(b => b.ChannelId == rec.ChannelId && b.UserId == user.Id && b.Role == "Admin");

            if (!isAdmin)
                return StatusCode(403, new { error = "You must be a admin of this channel to delete recommendations." });

            _context.Recommendations.Remove(rec);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Recommendation deleted." });
        }
    }
}
