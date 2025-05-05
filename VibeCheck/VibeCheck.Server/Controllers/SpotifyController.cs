using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VibeCheck.Server.Data;
using VibeCheck.Server.DTO;
using VibeCheck.Server.Models;
using VibeCheck.Server.Services;

namespace VibeCheck.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SpotifyController : ControllerBase
    {
        private readonly SpotifyService _spotifyService;

        public SpotifyController(SpotifyService spotifyService)
        {
            _spotifyService = spotifyService;
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string query)
        {
            var results = await _spotifyService.SearchTracksAsync(query);
            return Ok(results);
        }
    }
}