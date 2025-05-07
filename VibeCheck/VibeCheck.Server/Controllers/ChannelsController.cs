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
            Console.WriteLine($"[UpdateChannel] Called for channel ID: {id}");

            var channel = await _context.Channels
                .Include(c => c.BindCategoryChannels)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (channel == null)
            {
                Console.WriteLine($"[UpdateChannel] Channel {id} not found.");
                return NotFound();
            }

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
            var ch = await _context.Channels.FindAsync(id);
            if (ch == null) return NotFound();

            _context.Channels.Remove(ch);
            await _context.SaveChangesAsync();
            return NoContent();
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
