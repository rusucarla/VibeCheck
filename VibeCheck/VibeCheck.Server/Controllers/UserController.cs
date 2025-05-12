using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using VibeCheck.Server.Data;
using VibeCheck.Server.Controllers;
using VibeCheck.Server.Models;

public class UpdateUserDto
{
    public string UserName { get; set; }
    public string Email { get; set; }
    public string PhoneNumber { get; set; }
}


namespace VibeCheck.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public UserController(ApplicationDbContext context, UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            _context = context;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        // GET: api/user/{id}
        [Authorize(Roles = "User, Admin")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(string id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }
            return Ok(user);
        }

        // GET: api/user
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .Include(u => u.TopTmdbItems)
                .Include(u => u.TopSongs)
                .ToListAsync();

            return Ok(users);
        }

        // DELETE: api/users/{id}
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await _context.Users
                .Include(u => u.BindChannelUsers)
                .Include(u => u.BindRequestChannelUsers)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            // Stergem toate canalele unde e singurul admin
            var channelsToRemove = _context.Channels
                .Include(c => c.BindChannelUser)
                .Where(c => c.BindChannelUser.Any(b => b.UserId == id && b.Role == "Admin") &&
                            c.BindChannelUser.Count(b => b.Role == "Admin") == 1)
                .ToList();

            _context.Channels.RemoveRange(channelsToRemove);
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "User deleted successfully" });
        }

        // POST: api/users/promote/{id}
        [Authorize(Roles = "Admin")]
        [HttpPost("promote/{id}")]
        public async Task<IActionResult> PromoteUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound(new { message = "User not found" });

            var roles = await _userManager.GetRolesAsync(user);
            if (!roles.Contains("User")) return BadRequest(new { message = "User is already an admin" });

            await _userManager.RemoveFromRoleAsync(user, "User");
            await _userManager.AddToRoleAsync(user, "Admin");

            return Ok(new { message = "User promoted to Admin" });
        }

        // POST: api/users/demote/{id}
        [Authorize(Roles = "Admin")]
        [HttpPost("demote/{id}")]
        public async Task<IActionResult> DemoteUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound(new { message = "User not found" });

            var roles = await _userManager.GetRolesAsync(user);
            if (!roles.Contains("Admin")) return BadRequest(new { message = "User is already a regular user" });

            await _userManager.RemoveFromRoleAsync(user, "Admin");
            await _userManager.AddToRoleAsync(user, "User");

            return Ok(new { message = "User demoted to User" });
        }

        // Find the role of the user
        // GET: api/users/role
        [Authorize(Roles = "User, Admin")]
        [HttpGet("role")]
        public async Task<IActionResult> GetCurrentUserRole()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized(new { message = "User not found" });
            }

            var roles = await _userManager.GetRolesAsync(user);
            return Ok(new { roles });
        }



        // GET: api/users/info
        [Authorize(Roles = "User, Admin")]
        [HttpGet("info")]
        public async Task<IActionResult> GetUserInfo()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized(new { message = "User not found" });
            }

            return Ok(new
            {
                user.Id,
                user.UserName,
                user.Email,
                user.PhoneNumber
            });
        }

        // PUT: api/users/update
        [Authorize]
        [HttpPost("update")]
        [Consumes("application/json")]
        public async Task<IActionResult> UpdateUser([FromBody] UpdateUserDto updatedData)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized(new { message = "User not found" });
            }

            user.UserName = updatedData.UserName ?? user.UserName;
            user.Email = updatedData.Email ?? user.Email;
            user.PhoneNumber = updatedData.PhoneNumber ?? user.PhoneNumber;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                return BadRequest(new { message = "Failed to update user", errors = result.Errors });
            }

            return Ok(new
            {
                //user.Id,
                user.UserName,
                user.Email,
                user.PhoneNumber
            });
        }

        //poza profi
        // POST: api/user/upload-profile-picture
        [Authorize]
        [HttpPost("upload-profile-picture")]
        public async Task<IActionResult> UploadProfilePicture(IFormFile file)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null || file == null || file.Length == 0)
                return BadRequest("Invalid file.");

            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);
            user.ProfilePicture = ms.ToArray();
            user.ProfilePictureContentType = file.ContentType;

            await _userManager.UpdateAsync(user);

            return Ok(new { message = "Profile picture uploaded successfully." });
        }

        // GET: api/user/profile-picture
        [Authorize]
        [HttpGet("profile-picture")]
        public async Task<IActionResult> GetProfilePicture()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user?.ProfilePicture == null)
                return NotFound();

            return File(user.ProfilePicture, user.ProfilePictureContentType ?? "image/jpeg");
        }


    }
}
