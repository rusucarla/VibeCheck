using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VibeCheck.Server.Data;
using VibeCheck.Models;
using VibeCheck.Server.DTO;
using VibeCheck.Server.Models;
using VibeCheck.Server.Services;

namespace VibeCheck.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TopSongsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SpotifyService _spotifyService;

        public TopSongsController(ApplicationDbContext context, UserManager<ApplicationUser> userManager, SpotifyService spotifyService)
        {
            _context = context;
            _userManager = userManager;
            _spotifyService = spotifyService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TopSongGetDTO>>> GetTopSongs()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var topSongs = await _context.TopSongs
                .Where(t => t.UserId == user.Id)
                .OrderBy(t => t.Position)
                .ToListAsync();

            var result = new List<TopSongGetDTO>();

            foreach (var song in topSongs)
            {
                var track = await _spotifyService.GetTrackByIdAsync(song.SpotifyTrackId);
                if (track == null) continue;

                result.Add(new TopSongGetDTO
                {
                    SpotifyTrackId = song.SpotifyTrackId,
                    Position = song.Position,
                    Title = track.Name ?? "",
                    Artist = track.Artist ?? "",
                    ImageUrl = track.ImageUrl ?? ""
                });
            }

            return result;
        }

        [HttpPost]
        public async Task<IActionResult> AddOrUpdateTopSong([FromBody] TopSongPostDTO model)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            if (model.Position < 1 || model.Position > 5)
                return BadRequest("Position must be between 1 and 5.");

            var existing = await _context.TopSongs
                .FirstOrDefaultAsync(t => t.UserId == user.Id && t.Position == model.Position);

            if (existing != null)
            {
                existing.SpotifyTrackId = model.SpotifyTrackId;
            }
            else
            {
                var count = await _context.TopSongs.CountAsync(t => t.UserId == user.Id);
                if (count >= 5)
                    return BadRequest("You can only have 5 top songs.");

                _context.TopSongs.Add(new TopSong
                {
                    UserId = user.Id,
                    SpotifyTrackId = model.SpotifyTrackId,
                    Position = model.Position
                });
            }

            await _context.SaveChangesAsync();
            return Ok();
        }
    }

}