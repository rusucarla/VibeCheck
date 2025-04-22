using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VibeCheck.Server.Data;
using VibeCheck.Server.DTO;
using VibeCheck.Models;

namespace VibeCheck.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ChannelsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public ChannelsController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // GET: api/channels
        [HttpGet]
        public async Task<IActionResult> GetChannels()
        {
            var channels = await _context.Channels.Include(c => c.Category).ToListAsync();
            return Ok(channels);
        }

        // GET: api/channels/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetChannel(int id)
        {
            var channel = await _context.Channels
                .Include(c => c.Category)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (channel == null)
                return NotFound();

            return Ok(channel);
        }

        // POST: api/channels
        [HttpPost]
        public async Task<IActionResult> CreateChannel([FromBody] Channel channel)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            _context.Channels.Add(channel);
            await _context.SaveChangesAsync();

            var userId = _userManager.GetUserId(User);
            _context.BindChannelUserEntries.Add(new BindChannelUser
            {
                UserId = userId,
                ChannelId = channel.Id,
                Role = "Admin"
            });
            await _context.SaveChangesAsync();

            return Ok(channel);
        }

        // PUT: api/channels/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateChannel(int id, [FromBody] Channel updated)
        {
            var existing = await _context.Channels.FindAsync(id);
            if (existing == null)
                return NotFound();

            existing.Name = updated.Name;
            existing.Description = updated.Description;
            existing.CategoryId = updated.CategoryId;

            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        // DELETE: api/channels/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteChannel(int id)
        {
            var channel = await _context.Channels.FindAsync(id);
            if (channel == null)
                return NotFound();

            _context.Channels.Remove(channel);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
