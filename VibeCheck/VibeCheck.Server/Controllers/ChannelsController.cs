using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VibeCheck.Server.Data;
using VibeCheck.Server.DTO;
using VibeCheck.Server.Models;

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
        
        [HttpGet]
        public async Task<IActionResult> GetChannels([FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var query = _context.Channels
                .Include(c => c.BindCategoryChannels!)
                .ThenInclude(bcc => bcc.Category)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(c => c.Name!.Contains(search));

            var total = await query.CountAsync();

            var channels = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(c => new ChannelDTO
                {
                    Id = c.Id,
                    Name = c.Name!,
                    Description = c.Description!,
                    Categories = c.BindCategoryChannels
                        .Select(bcc => new CategoryDTO
                        {
                            Id = bcc.CategoryId,
                            Title = bcc.Category!.Title!
                        }).ToList()
                })
                .ToListAsync();

            return Ok(new
            {
                data = channels,
                currentPage = page,
                totalPages = (int)Math.Ceiling(total / (double)pageSize)
            });
        }
        
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetChannel(int id)
        {
            var c = await _context.Channels
                .Include(x => x.BindCategoryChannels!)
                .ThenInclude(bcc => bcc.Category)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (c == null) return NotFound();

            var dto = new ChannelDTO
            {
                Id = c.Id,
                Name = c.Name!,
                Description = c.Description!,
                Categories = c.BindCategoryChannels!
                    .Select(bcc => new CategoryDTO
                    {
                        Id = bcc.CategoryId,
                        Title = bcc.Category!.Title!
                    }).ToList()
            };

            return Ok(dto);
        }
        
        [HttpGet("subscribed")]
        public async Task<IActionResult> GetUserChannels()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            // Get user's channel memberships with their roles
            var userChannelMemberships = await _context.BindChannelUserEntries
                .Where(b => b.UserId == user.Id)
                .Select(b => new { b.ChannelId, b.Role })
                .ToListAsync();

            var channelIds = userChannelMemberships.Select(m => m.ChannelId).ToList();

            var channels = await _context.Channels
                .Include(c => c.BindCategoryChannels!)
                .ThenInclude(bcc => bcc.Category)
                .Where(c => channelIds.Contains(c.Id))
                .ToListAsync();

            var channelDTOs = channels.Select(c => {
                var membership = userChannelMemberships.First(m => m.ChannelId == c.Id);
                return new ChannelDTO
                {
                    Id = c.Id,
                    Name = c.Name!,
                    Description = c.Description!,
                    UserRole = membership.Role, // Include the user's role in this channel
                    Categories = c.BindCategoryChannels
                        .Select(bcc => new CategoryDTO
                        {
                            Id = bcc.CategoryId,
                            Title = bcc.Category!.Title!
                        }).ToList()
                };
            }).ToList();

            Console.WriteLine($"[GetUserChannels] Found {channelDTOs.Count} channels for user {user.Id}");

            return Ok(new { data = channelDTOs });
        }
        
        [HttpPost]
        public async Task<IActionResult> CreateChannel([FromBody] ChannelCreateDTO dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (dto.CategoryIds == null || dto.CategoryIds.Count < 1 || dto.CategoryIds.Count > 5)
                return BadRequest(new { message = "Select between 1 and 5 categories." });

            var existingCategoryIds = await _context.Categories
                .Where(c => dto.CategoryIds.Contains(c.Id))
                .Select(c => c.Id)
                .ToListAsync();

            var invalidIds = dto.CategoryIds.Except(existingCategoryIds).ToList();

            if (invalidIds.Any())
            {
                return BadRequest(new
                {
                    message = $"The following category ID(s) do not exist: {string.Join(", ", invalidIds)}"
                });
            }

            var channel = new Channel
            {
                Name = dto.Name,
                Description = dto.Description,
            };

            _context.Channels.Add(channel);
            await _context.SaveChangesAsync();

            foreach (var catId in dto.CategoryIds)
            {
                _context.BindCategoryChannelEntries.Add(new BindCategoryChannel
                {
                    ChannelId = channel.Id,
                    CategoryId = catId
                });
            }

            var userId = _userManager.GetUserId(User);
            _context.BindChannelUserEntries.Add(new BindChannelUser
            {
                UserId = userId,
                ChannelId = channel.Id,
                Role = "Admin"
            });

            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetChannel), new { id = channel.Id }, new { channel.Id });
        }
        
        // POST: api/channels/{channelId}/join-request
        [HttpPost("{channelId}/join-request")]
        public async Task<IActionResult> RequestToJoinChannel(int channelId)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            // Check if channel exists
            var channel = await _context.Channels.FindAsync(channelId);
            if (channel == null)
                return NotFound(new { message = "Channel not found" });

            // Check if user is already a member of this channel
            var existingMembership = await _context.BindChannelUserEntries
                .AnyAsync(b => b.ChannelId == channelId && b.UserId == user.Id);

            if (existingMembership)
                return BadRequest(new { message = "You are already a member of this channel" });

            // Check if user already has a pending request
            var pendingRequest = await _context.BindRequestChannelUserEntries
                .AnyAsync(b => b.ChannelId == channelId && b.UserId == user.Id && b.Status == "Pending");

            if (pendingRequest)
                return BadRequest(new { message = "You already have a pending request for this channel" });

            // Create join request
            var request = new Request
            {
                RequestType = "JoinChannel",
                CreatedAt = DateTime.UtcNow
            };
            _context.Requests.Add(request);
            await _context.SaveChangesAsync();

            // Create binding between request, channel and user
            var binding = new BindRequestChannelUser
            {
                ChannelId = channelId,
                UserId = user.Id,
                RequestId = request.Id,
                Status = "Pending"
            };
            _context.BindRequestChannelUserEntries.Add(binding);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Join request sent successfully" });
        }

        // GET: api/channels/admin/pending-requests
        [HttpGet("admin/pending-requests")]
        public async Task<IActionResult> GetPendingRequestsForAdminChannels()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            // Get channels where the user is an admin
            var adminChannelIds = await _context.BindChannelUserEntries
                .Where(b => b.UserId == user.Id && b.Role == "Admin")
                .Select(b => b.ChannelId)
                .ToListAsync();

            if (!adminChannelIds.Any())
                return Ok(new { data = new List<object>() });

            // Get pending join requests for those channels
            var pendingRequests = await _context.BindRequestChannelUserEntries
                .Include(b => b.Request)
                .Include(b => b.User)
                .Include(b => b.Channel)
                .Where(b => adminChannelIds.Contains(b.ChannelId) && 
                            b.Status == "Pending" && 
                            b.Request.RequestType == "JoinChannel")
                .Select(b => new
                {
                    RequestId = b.RequestId,
                    ChannelId = b.ChannelId,
                    ChannelName = b.Channel.Name,
                    UserId = b.UserId,
                    UserName = b.User.UserName,
                    CreatedAt = b.Request.CreatedAt
                })
                .ToListAsync();

            return Ok(new { data = pendingRequests });
        }

        // POST: api/channels/requests/{requestId}/approve
        [HttpPost("requests/{requestId}/approve")]
        public async Task<IActionResult> ApproveJoinRequest(int requestId)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            // Find the request binding
            var requestBinding = await _context.BindRequestChannelUserEntries
                .Include(b => b.Request)
                .FirstOrDefaultAsync(b => b.RequestId == requestId && b.Status == "Pending");

            if (requestBinding == null)
                return NotFound(new { message = "Request not found or already processed" });

            // Check if the current user is an admin of the channel
            var isAdmin = await _context.BindChannelUserEntries
                .AnyAsync(b => b.ChannelId == requestBinding.ChannelId && b.UserId == user.Id && b.Role == "Admin");

            if (!isAdmin)
                return Forbid();

            // Update request status
            requestBinding.Status = "Approved";
            requestBinding.Request.ProcessedAt = DateTime.UtcNow;

            // Add user to channel as a regular member
            _context.BindChannelUserEntries.Add(new BindChannelUser
            {
                ChannelId = requestBinding.ChannelId,
                UserId = requestBinding.UserId,
                Role = "Member"
            });

            await _context.SaveChangesAsync();
            return Ok(new { message = "Join request approved" });
        }

        // POST: api/channels/requests/{requestId}/reject
        [HttpPost("requests/{requestId}/reject")]
        public async Task<IActionResult> RejectJoinRequest(int requestId)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            // Find the request binding
            var requestBinding = await _context.BindRequestChannelUserEntries
                .Include(b => b.Request)
                .FirstOrDefaultAsync(b => b.RequestId == requestId && b.Status == "Pending");

            if (requestBinding == null)
                return NotFound(new { message = "Request not found or already processed" });

            // Check if the current user is an admin of the channel
            var isAdmin = await _context.BindChannelUserEntries
                .AnyAsync(b => b.ChannelId == requestBinding.ChannelId && b.UserId == user.Id && b.Role == "Admin");

            if (!isAdmin)
                return Forbid();

            // Update request status
            requestBinding.Status = "Rejected";
            requestBinding.Request.ProcessedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Join request rejected" });
        }
        
        // GET: api/channels/{channelId}/users
        [HttpGet("{channelId}/users")]
        public async Task<IActionResult> GetChannelUsers(int channelId)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            // Check if channel exists
            var channel = await _context.Channels.FindAsync(channelId);
            if (channel == null)
                return NotFound(new { message = "Channel not found" });

            // Check if the current user is an admin of the channel
            var isAdmin = await _context.BindChannelUserEntries
                .AnyAsync(b => b.ChannelId == channelId && b.UserId == user.Id && b.Role == "Admin");

            var isGlobalAdmin = await _userManager.IsInRoleAsync(user, "Admin");

            if (!isAdmin && !isGlobalAdmin)
                return Forbid();

            // Get all users in the channel with their roles
            var channelUsers = await _context.BindChannelUserEntries
                .Where(b => b.ChannelId == channelId)
                .Join(_context.Users,
                    binding => binding.UserId,
                    appUser => appUser.Id,
                    (binding, appUser) => new
                    {
                        Id = appUser.Id,
                        UserName = appUser.UserName,
                        DisplayName = appUser.DisplayName,
                        Role = binding.Role
                    })
                .ToListAsync();

            return Ok(channelUsers);
        }

        // POST: api/channels/{channelId}/users/{userId}/promote
        [HttpPost("{channelId}/users/{userId}/promote")]
        public async Task<IActionResult> PromoteChannelUser(int channelId, string userId)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser == null) return Unauthorized();

            // Check if channel exists
            var channel = await _context.Channels.FindAsync(channelId);
            if (channel == null)
                return NotFound(new { message = "Channel not found" });

            // Check if the current user is an admin of the channel
            var isAdmin = await _context.BindChannelUserEntries
                .AnyAsync(b => b.ChannelId == channelId && b.UserId == currentUser.Id && b.Role == "Admin");

            var isGlobalAdmin = await _userManager.IsInRoleAsync(currentUser, "Admin");

            if (!isAdmin && !isGlobalAdmin)
                return Forbid();

            // Check if the target user exists and is a member of the channel
            var userToPromote = await _context.BindChannelUserEntries
                .FirstOrDefaultAsync(b => b.ChannelId == channelId && b.UserId == userId);

            if (userToPromote == null)
                return NotFound(new { message = "User not found in this channel" });

            if (userToPromote.Role == "Admin")
                return BadRequest(new { message = "User is already an admin" });

            // Promote user to Admin
            userToPromote.Role = "Admin";
            await _context.SaveChangesAsync();

            return Ok(new { message = "User promoted to Admin successfully" });
        }

        // POST: api/channels/{channelId}/users/{userId}/demote
        [HttpPost("{channelId}/users/{userId}/demote")]
        public async Task<IActionResult> DemoteChannelUser(int channelId, string userId)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser == null) return Unauthorized();

            // Check if channel exists
            var channel = await _context.Channels.FindAsync(channelId);
            if (channel == null)
                return NotFound(new { message = "Channel not found" });

            // Check if the current user is an admin of the channel
            var isAdmin = await _context.BindChannelUserEntries
                .AnyAsync(b => b.ChannelId == channelId && b.UserId == currentUser.Id && b.Role == "Admin");

            var isGlobalAdmin = await _userManager.IsInRoleAsync(currentUser, "Admin");

            if (!isAdmin && !isGlobalAdmin)
                return Forbid();

            // Prevent self-demotion to ensure there's always at least one admin
            if (userId == currentUser.Id)
                return BadRequest(new { message = "You cannot demote yourself" });

            // Check if the target user exists and is a member of the channel
            var userToDemote = await _context.BindChannelUserEntries
                .FirstOrDefaultAsync(b => b.ChannelId == channelId && b.UserId == userId);

            if (userToDemote == null)
                return NotFound(new { message = "User not found in this channel" });

            if (userToDemote.Role == "Member")
                return BadRequest(new { message = "User is already a member" });

            // Check if this is the last admin
            var adminCount = await _context.BindChannelUserEntries
                .CountAsync(b => b.ChannelId == channelId && b.Role == "Admin");

            if (adminCount <= 1)
                return BadRequest(new { message = "Cannot demote the last admin of the channel" });

            // Demote user to Member
            userToDemote.Role = "Member";
            await _context.SaveChangesAsync();

            return Ok(new { message = "User demoted to Member successfully" });
        }

        // POST: api/channels/{channelId}/users/{userId}/remove
        [HttpPost("{channelId}/users/{userId}/remove")]
        public async Task<IActionResult> RemoveChannelUser(int channelId, string userId)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser == null) return Unauthorized();

            // Check if channel exists
            var channel = await _context.Channels.FindAsync(channelId);
            if (channel == null)
                return NotFound(new { message = "Channel not found" });

            // Check if the current user is an admin of the channel
            var isAdmin = await _context.BindChannelUserEntries
                .AnyAsync(b => b.ChannelId == channelId && b.UserId == currentUser.Id && b.Role == "Admin");

            var isGlobalAdmin = await _userManager.IsInRoleAsync(currentUser, "Admin");

            if (!isAdmin && !isGlobalAdmin)
                return Forbid();

            // Prevent self-removal if the user is the last admin
            if (userId == currentUser.Id)
            {
                var adminCount = await _context.BindChannelUserEntries
                    .CountAsync(b => b.ChannelId == channelId && b.Role == "Admin");

                if (adminCount <= 1)
                    return BadRequest(new { message = "You cannot remove yourself as you are the last admin" });
            }

            // Check if the target user exists and is a member of the channel
            var userToRemove = await _context.BindChannelUserEntries
                .FirstOrDefaultAsync(b => b.ChannelId == channelId && b.UserId == userId);

            if (userToRemove == null)
                return NotFound(new { message = "User not found in this channel" });

            // Remove the user from the channel
            _context.BindChannelUserEntries.Remove(userToRemove);
            await _context.SaveChangesAsync();

            return Ok(new { message = "User removed from the channel successfully" });
        }
        
        // [HttpPut("{id:int}")]
        // public async Task<IActionResult> UpdateChannel(int id, [FromBody] ChannelCreateDTO dto)
        // {
        //     var channel = await _context.Channels
        //         .Include(c => c.BindCategoryChannels)
        //         .FirstOrDefaultAsync(c => c.Id == id);
        //
        //     if (channel == null) return NotFound();
        //
        //     if (dto.CategoryIds == null || dto.CategoryIds.Count < 1 || dto.CategoryIds.Count > 5)
        //         return BadRequest(new { message = "Select between 1 and 5 categories." });
        //
        //     // var existingCategoryIds = channel.BindCategoryChannels.Select(b => b.CategoryId).ToList();
        //     var existingCategoryIds = await _context.Categories
        //         .Where(c => dto.CategoryIds.Contains(c.Id))
        //         .Select(c => c.Id)
        //         .ToListAsync();
        //
        //     var invalidIds = dto.CategoryIds.Except(existingCategoryIds).ToList();
        //
        //     if (invalidIds.Any())
        //     {
        //         return BadRequest(new
        //         {
        //             message = $"The following category ID(s) do not exist: {string.Join(", ", invalidIds)}"
        //         });
        //     }
        //
        //     var toRemove = channel.BindCategoryChannels.Where(b => !dto.CategoryIds.Contains(b.CategoryId)).ToList();
        //     _context.BindCategoryChannelEntries.RemoveRange(toRemove);
        //
        //     foreach (var catId in dto.CategoryIds.Except(existingCategoryIds))
        //     {
        //         _context.BindCategoryChannelEntries.Add(new BindCategoryChannel
        //         {
        //             ChannelId = id,
        //             CategoryId = catId
        //         });
        //     }
        //
        //     channel.Name = dto.Name;
        //     channel.Description = dto.Description;
        //
        //     await _context.SaveChangesAsync();
        //
        //     return NoContent();
        // }
        
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateChannel(int id, [FromBody] ChannelCreateDTO dto)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();
            
            Console.WriteLine($"[UpdateChannel] Called for channel ID: {id}");

            var channel = await _context.Channels
                .Include(c => c.BindCategoryChannels)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (channel == null)
            {
                Console.WriteLine($"[UpdateChannel] Channel {id} not found.");
                return NotFound();
            }
            
            // Check if user is channel admin or global admin
            var isChannelAdmin = await _context.BindChannelUserEntries
                .AnyAsync(b => b.ChannelId == id && b.UserId == user.Id && b.Role == "Admin");
    
            var isGlobalAdmin = await _userManager.IsInRoleAsync(user, "Admin");

            if (!isChannelAdmin && !isGlobalAdmin)
                return Forbid();

            if (dto.CategoryIds == null || dto.CategoryIds.Count < 1 || dto.CategoryIds.Count > 5)
            {
                Console.WriteLine($"[UpdateChannel] Invalid number of categories: {dto.CategoryIds?.Count ?? 0}");
                return BadRequest(new { message = "Select between 1 and 5 categories." });
            }

            var existingIds = await _context.Categories
                .Where(c => dto.CategoryIds.Contains(c.Id))
                .Select(c => c.Id)
                .ToListAsync();

            var invalidIds = dto.CategoryIds.Except(existingIds).ToList();
            if (invalidIds.Any())
            {
                Console.WriteLine($"[UpdateChannel] Invalid category IDs: {string.Join(", ", invalidIds)}");
                return BadRequest(new
                {
                    message = $"The following category ID(s) do not exist: {string.Join(", ", invalidIds)}"
                });
            }

            Console.WriteLine($"[UpdateChannel] Removing {channel.BindCategoryChannels.Count} existing bindings...");
            _context.BindCategoryChannelEntries.RemoveRange(channel.BindCategoryChannels);

            foreach (var catId in dto.CategoryIds)
            {
                Console.WriteLine($"[UpdateChannel] Binding Category {catId} to Channel {id}");
                _context.BindCategoryChannelEntries.Add(new BindCategoryChannel
                {
                    ChannelId = id,
                    CategoryId = catId
                });
            }

            channel.Name = dto.Name;
            channel.Description = dto.Description;

            Console.WriteLine("[UpdateChannel] Saving changes...");
            await _context.SaveChangesAsync();
            Console.WriteLine("[UpdateChannel] Channel updated successfully.");

            return NoContent();
        }

        
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteChannel(int id)
        {
            
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();
            var ch = await _context.Channels.FindAsync(id);
            if (ch == null) return NotFound();
            
            // Check if user is channel admin or global admin
            var isChannelAdmin = await _context.BindChannelUserEntries
                .AnyAsync(b => b.ChannelId == id && b.UserId == user.Id && b.Role == "Admin");
    
            var isGlobalAdmin = await _userManager.IsInRoleAsync(user, "Admin");

            if (!isChannelAdmin && !isGlobalAdmin)
                return Forbid();

            _context.Channels.Remove(ch);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        
        // POST: api/channels/{channelId}/leave
        [HttpPost("{channelId}/leave")]
        public async Task<IActionResult> LeaveChannel(int channelId)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            // Check if channel exists
            var channel = await _context.Channels.FindAsync(channelId);
            if (channel == null)
                return NotFound(new { message = "Channel not found" });

            // Check if user is a member of this channel
            var membership = await _context.BindChannelUserEntries
                .FirstOrDefaultAsync(b => b.ChannelId == channelId && b.UserId == user.Id);

            if (membership == null)
                return BadRequest(new { message = "You are not a member of this channel" });

            // Check if user is the only admin of the channel
            if (membership.Role == "Admin")
            {
                var adminCount = await _context.BindChannelUserEntries
                    .CountAsync(b => b.ChannelId == channelId && b.Role == "Admin");
        
                if (adminCount == 1)
                    return BadRequest(new { message = "You cannot leave as you are the only admin of this channel" });
            }

            // Remove user from channel
            _context.BindChannelUserEntries.Remove(membership);
            await _context.SaveChangesAsync();

            return Ok(new { message = "You have left the channel successfully" });
        }

        // GET: api/channels/{channelId}/messages
        [HttpGet("{channelId}/messages")]
        public async Task<IActionResult> GetMessages(int channelId)
        {
            var messages = await _context.Messages
                .Where(m => m.ChannelId == channelId)
                .OrderBy(m => m.Date)
                .Join(_context.Users,
                    message => message.UserId,
                    user => user.Id,
                    (message, user) => new MessageResponseDto
                    {
                        Id = message.Id,
                        Content = message.Content,
                        FilePath = message.FilePath,
                        FileType = message.FileType,
                        Date = message.Date ?? DateTime.UtcNow,
                        UserId = message.UserId,
                        UserName = !string.IsNullOrEmpty(user.DisplayName) ? user.DisplayName : user.UserName,
                        ChannelId = message.ChannelId
                    })
                .ToListAsync();

            return Ok(messages);
        }


        // POST: api/channels/{channelId}/messages
        [HttpPost("{channelId}/messages")]
        public async Task<IActionResult> PostMessage(int channelId, [FromBody] CreateMessageDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Content) && string.IsNullOrWhiteSpace(dto.FilePath))
                return BadRequest("Message content or file is required.");

            // Obține utilizatorul autentificat
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var message = new Message
            {
                Content = dto.Content,
                FilePath = dto.FilePath,
                FileType = dto.FileType,
                Date = DateTime.UtcNow,
                UserId = user.Id,
                ChannelId = channelId
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            return Ok(new MessageResponseDto
            {
                Id = message.Id,
                Content = message.Content,
                FilePath = message.FilePath,
                FileType = message.FileType,
                Date = message.Date ?? DateTime.UtcNow,
                UserId = message.UserId,
                UserName = user.DisplayName ?? user.UserName ?? "Unknown",
                ChannelId = message.ChannelId
            });
        }








        /*// GET api/channels?page=1&pageSize=10&search=chat
        [HttpGet]
        public async Task<IActionResult> GetChannels([FromQuery] string? search,
                                                     [FromQuery] int page = 1,
                                                     [FromQuery] int pageSize = 10)
        {
            var query = _context.Channels
                .Include(c => c.Category)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(c => c.Name!.Contains(search));

            var total = await query.CountAsync();

            var channels = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(c => new ChannelDTO
                {
                    Id          = c.Id,
                    Name        = c.Name!,
                    Description = c.Description!,
                    Category    = new CategoryDTO { Id = c.Category!.Id, Title = c.Category.Title! }
                })
                .ToListAsync();

            return Ok(new
            {
                data        = channels,
                currentPage = page,
                totalPages  = (int)Math.Ceiling(total / (double)pageSize)
            });
        }

        // GET api/channels/5
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetChannel(int id)
        {
            var c = await _context.Channels
                      .Include(x => x.Category)
                      .FirstOrDefaultAsync(x => x.Id == id);

            if (c == null) return NotFound();

            var dto = new ChannelDTO
            {
                Id          = c.Id,
                Name        = c.Name!,
                Description = c.Description!,
                Category    = new CategoryDTO { Id = c.Category!.Id, Title = c.Category.Title! }
            };

            return Ok(dto);
        }

        // POST api/channels
        [HttpPost]
        public async Task<IActionResult> CreateChannel([FromBody] ChannelCreateDTO dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // verifica dacă există categoria
            var category = await _context.Categories.FindAsync(dto.CategoryId);
            if (category == null)
                return BadRequest(new { message = "Category not found." });

            var channel = new Channel
            {
                Name        = dto.Name,
                Description = dto.Description,
                CategoryId  = dto.CategoryId
            };

            _context.Channels.Add(channel);
            await _context.SaveChangesAsync();

            // creatorul devine admin local
            var userId = _userManager.GetUserId(User);
            _context.BindChannelUserEntries.Add(new BindChannelUser
            {
                UserId    = userId,
                ChannelId = channel.Id,
                Role      = "Admin"
            });
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetChannel), new { id = channel.Id }, new { channel.Id });
        }

        // PUT api/channels/5
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateChannel(int id, [FromBody] ChannelCreateDTO dto)
        {
            var ch = await _context.Channels.FindAsync(id);
            if (ch == null) return NotFound();

            ch.Name        = dto.Name;
            ch.Description = dto.Description;
            ch.CategoryId  = dto.CategoryId;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE api/channels/5
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteChannel(int id)
        {
            var ch = await _context.Channels.FindAsync(id);
            if (ch == null) return NotFound();

            _context.Channels.Remove(ch);
            await _context.SaveChangesAsync();
            return NoContent();
        }*/
    }

    /*[Route("api/[controller]")]
    [ApiController]
    [Authorize]
    // var ioana
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
    }*/
}
