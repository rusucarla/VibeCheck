using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Threading.Tasks;

namespace VibeCheck.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FilesController : ControllerBase
    {
        private readonly string _uploadsFolder;
        private readonly long _maxFileSize = 10 * 1024 * 1024; // 10MB
        
        public FilesController(IWebHostEnvironment hostEnvironment)
        {
            _uploadsFolder = Path.Combine(hostEnvironment.ContentRootPath, "Uploads");
            if (!Directory.Exists(_uploadsFolder))
            {
                Directory.CreateDirectory(_uploadsFolder);
            }
        }
        
        [HttpPost("upload")]
        public async Task<IActionResult> UploadFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file selected");
                
            if (file.Length > _maxFileSize)
                return BadRequest("File size exceeds the 10MB limit");
                
            // Create subfolder based on date to organize files
            var today = DateTime.UtcNow.ToString("yyyy-MM-dd");
            var userFolder = Path.Combine(_uploadsFolder, today);
            if (!Directory.Exists(userFolder))
                Directory.CreateDirectory(userFolder);
                
            // Create unique filename
            var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
            var filePath = Path.Combine(userFolder, uniqueFileName);
            
            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            
            // Return the relative path for client access
            var relativePath = $"/uploads/{today}/{uniqueFileName}";
            
            return Ok(new { filePath = relativePath });
        }
    }
}