using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using VibeCheck.Models;
using VibeCheck.Server.Data;
using VibeCheck.Server.DTO;
using VibeCheck.Server.Models;
using VibeCheck.Server.Services;

namespace VibeCheck.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TopTmdbController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly TmdbService _tmdbService;

        public TopTmdbController(ApplicationDbContext context, UserManager<ApplicationUser> userManager, TmdbService tmdbService)
        {
            _context = context;
            _userManager = userManager;
            _tmdbService = tmdbService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TopTmdbGetDTO>>> GetTopTmdb()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var top = await _context.TopTmdbItems
                .Where(t => t.UserId == user.Id)
                .OrderBy(t => t.Position)
                .ToListAsync();

            var result = new List<TopTmdbGetDTO>();

            foreach (var item in top)
            {
                var media = await _tmdbService.GetByIdAsync(item.TmdbId, item.MediaType);
                if (media == null) continue;

                result.Add(new TopTmdbGetDTO
                {
                    TmdbId = item.TmdbId,
                    MediaType = item.MediaType,
                    Position = item.Position,
                    Title = media.Title,
                    PosterUrl = media.PosterUrl
                });
            }

            return result;
        }

        [HttpPost]
        public async Task<IActionResult> AddOrUpdateTopTmdb([FromBody] TopTmdbPostDTO dto)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            if (dto.Position < 1 || dto.Position > 5)
                return BadRequest("Position must be between 1 and 5.");

            var mediaType = await _tmdbService.GetMediaTypeByIdAsync(dto.TmdbId);
            if (mediaType == null)
                return NotFound("TMDb item not found as movie or TV show.");

            var existing = await _context.TopTmdbItems
                .FirstOrDefaultAsync(t => t.UserId == user.Id && t.Position == dto.Position);

            if (existing != null)
            {
                existing.TmdbId = dto.TmdbId;
                existing.MediaType = mediaType;
            }
            else
            {
                var count = await _context.TopTmdbItems.CountAsync(t => t.UserId == user.Id);
                if (count >= 5)
                    return BadRequest("You can only have 5 top TMDB items.");

                _context.TopTmdbItems.Add(new TopTmdb
                {
                    UserId = user.Id,
                    TmdbId = dto.TmdbId,
                    MediaType = mediaType,
                    Position = dto.Position
                });
            }

            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
