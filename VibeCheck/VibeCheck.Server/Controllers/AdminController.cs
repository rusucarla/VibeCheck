using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using VibeCheck.Server.Data;
using VibeCheck.Server.Models;

namespace VibeCheck.Server.Controllers
{
    [Route("api/admin")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public AdminController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
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

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var currentUser = await _userManager.GetUserAsync(User);
            var users = await _userManager.Users
                .Select(u => new
                {
                    u.Id,
                    u.UserName,
                    u.Email,
                    u.CreatedAt,
                    Role = _userManager.GetRolesAsync(u).Result.FirstOrDefault() ?? "User"
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpPost("users/{id}/promote")]
        public async Task<IActionResult> PromoteToAdmin(string id)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            var targetUser = await _userManager.FindByIdAsync(id);

            if (targetUser == null)
                return NotFound(new { message = "User not found" });

            if (currentUser.Id == targetUser.Id)
                return BadRequest(new { message = "You cannot promote yourself" });

            var userRoles = await _userManager.GetRolesAsync(targetUser);
            if (userRoles.Contains("Admin"))
                return BadRequest(new { message = "User is already an admin" });

            await _userManager.RemoveFromRoleAsync(targetUser, "User");
            await _userManager.AddToRoleAsync(targetUser, "Admin");

            return Ok(new { message = "User promoted to admin successfully" });
        }

        [HttpPost("users/{id}/demote")]
        public async Task<IActionResult> DemoteFromAdmin(string id)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            var targetUser = await _userManager.FindByIdAsync(id);

            if (targetUser == null)
                return NotFound(new { message = "User not found" });

            if (currentUser.Id == targetUser.Id)
                return BadRequest(new { message = "You cannot demote yourself" });

            var admins = await _userManager.GetUsersInRoleAsync("Admin");
            if (admins.Count <= 1)
                return BadRequest(new { message = "Cannot demote the last admin" });

            var userRoles = await _userManager.GetRolesAsync(targetUser);
            if (!userRoles.Contains("Admin"))
                return BadRequest(new { message = "User is not an admin" });

            await _userManager.RemoveFromRoleAsync(targetUser, "Admin");
            await _userManager.AddToRoleAsync(targetUser, "User");

            return Ok(new { message = "User demoted successfully" });
        }
    }
}