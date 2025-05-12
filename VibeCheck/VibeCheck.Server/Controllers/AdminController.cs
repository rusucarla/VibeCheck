using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VibeCheck.Server.Data;

namespace VibeCheck.Server.Controllers
{
    [Route("api/admin")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("overview")]
        public async Task<IActionResult> GetOverview()
        {
            var totalUsers = await _context.Users.CountAsync();
            var totalChannels = await _context.Channels.CountAsync();
            var totalRecommendations = await _context.Recommendations.CountAsync();

            return Ok(new
            {
                totalUsers,
                totalChannels,
                totalRecommendations
            });
        }

        [HttpGet("recent-users")]
        public async Task<IActionResult> GetRecentUsers()
        {
            var users = await _context.Users
                .OrderByDescending(u => u.CreatedAt)
                .Take(5)
                .Select(u => new
                {
                    u.Id,
                    u.UserName,
                    u.Email,
                    u.CreatedAt
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("registrations-last-7-days")]
        public async Task<IActionResult> GetUserRegistrationsLast7Days()
        {
            var today = DateTime.UtcNow.Date;

            var data = await _context.Users
                .Where(u => u.CreatedAt >= today.AddDays(-6))
                .GroupBy(u => u.CreatedAt.Date)
                .Select(g => new
                {
                    date = g.Key,
                    count = g.Count()
                })
                .ToListAsync();

            var result = Enumerable.Range(0, 7)
                .Select(i => today.AddDays(-6 + i))
                .Select(date => new {
                    date = date.ToString("yyyy-MM-dd"),
                    count = data.FirstOrDefault(d => d.date == date)?.count ?? 0
                });

            return Ok(result);
        }


    }
}

