using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VibeCheck.Server.Data;
using VibeCheck.Server.DTO;
using VibeCheck.Server.Models;

namespace VibeCheck.Server.Controllers
{
    // [Authorize(Roles = "Admin")]
    // [Route("api/[controller]")]
    // [ApiController]
    // public class CategoriesController : ControllerBase
    // {
    //     private readonly ApplicationDbContext _context;
    //
    //     public CategoriesController(ApplicationDbContext context)
    //     {
    //         _context = context;
    //     }
    //
    //     [HttpGet]
    //     public async Task<IActionResult> GetCategories([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 9)
    //     {
    //         var query = _context.Categories.Include(c => c.Channels).AsQueryable();
    //
    //         if (!string.IsNullOrWhiteSpace(search))
    //         {
    //             query = query.Where(c => c.Title != null && c.Title.Contains(search));
    //         }
    //
    //         var totalItems = await query.CountAsync();
    //         var categories = await query
    //             .Skip((page - 1) * pageSize)
    //             .Take(pageSize)
    //             .ToListAsync();
    //
    //         return Ok(new
    //         {
    //             data = categories,
    //             currentPage = page,
    //             totalPages = (int)Math.Ceiling(totalItems / (double)pageSize)
    //         });
    //     }
    //
    //     [HttpPost]
    //     public async Task<IActionResult> CreateCategory([FromBody] CategoryCreateDTO dto)
    //     {
    //         if (!ModelState.IsValid) return BadRequest(ModelState);
    //
    //         var category = new Category { Title = dto.Title };
    //
    //         _context.Categories.Add(category);
    //         await _context.SaveChangesAsync();
    //
    //         return Ok(new { message = "Category created", id = category.Id });
    //     }
    //
    //     [HttpPut("{id}")]
    //     public async Task<IActionResult> UpdateCategory(int id, [FromBody] CategoryCreateDTO dto)
    //     {
    //         var category = await _context.Categories.FindAsync(id);
    //         if (category == null) return NotFound();
    //
    //         category.Title = dto.Title;
    //         await _context.SaveChangesAsync();
    //
    //         return Ok(new { message = "Category updated" });
    //     }
    //
    //     [HttpDelete("{id}")]
    //     public async Task<IActionResult> DeleteCategory(int id)
    //     {
    //         var category = await _context.Categories.FindAsync(id);
    //         if (category == null) return NotFound();
    //
    //         _context.Categories.Remove(category);
    //         await _context.SaveChangesAsync();
    //
    //         return Ok(new { message = "Category deleted" });
    //     }
    //
    //     [HttpGet("{id}")]
    //     public async Task<IActionResult> GetCategoryById(int id)
    //     {
    //         var category = await _context.Categories
    //             .Include(c => c.Channels)
    //             .FirstOrDefaultAsync(c => c.Id == id);
    //
    //         if (category == null)
    //         {
    //             return NotFound(new { message = "Category not found" });
    //         }
    //
    //         return Ok(category);
    //     }
    //
    // }
    
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CategoriesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetCategories([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 9)
        {
            var query = _context.Categories
                .Include(c => c.BindCategoryChannels!)
                    .ThenInclude(b => b.Channel)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(c => c.Title != null && c.Title.Contains(search));
            }

            var totalItems = await query.CountAsync();
            var categories = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(c => new
                {
                    c.Id,
                    c.Title,
                    Channels = c.BindCategoryChannels!
                        .Where(b => b.Channel != null)
                        .Select(b => new
                        {
                            b.Channel!.Id,
                            b.Channel.Name
                        })
                        .ToList()
                })
                .ToListAsync();

            return Ok(new
            {
                data = categories,
                currentPage = page,
                totalPages = (int)Math.Ceiling(totalItems / (double)pageSize)
            });
        }
        
        [HttpGet("all")]
        public async Task<IActionResult> GetAllCategories()
        {
            var categories = await _context.Categories
                .Select(c => new CategoryDTO
                {
                    Id = c.Id,
                    Title = c.Title!
                })
                .ToListAsync();

            return Ok(categories);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategoryById(int id)
        {
            var category = await _context.Categories
                .Include(c => c.BindCategoryChannels!)
                    .ThenInclude(b => b.Channel)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
                return NotFound(new { message = "Category not found" });

            var result = new
            {
                category.Id,
                category.Title,
                Channels = category.BindCategoryChannels!
                    .Where(b => b.Channel != null)
                    .Select(b => new
                    {
                        b.Channel!.Id,
                        b.Channel.Name
                    })
                    .ToList()
            };

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateCategory([FromBody] CategoryCreateDTO dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var category = new Category { Title = dto.Title };
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Category created", id = category.Id });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] CategoryCreateDTO dto)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return NotFound();

            category.Title = dto.Title;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Category updated" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return NotFound();

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Category deleted" });
        }
    }

}
