using Microsoft.AspNetCore.Identity;
using VibeCheck.Server.Models;

namespace VibeCheck.Server.Models
{
	public class ApplicationUser : IdentityUser
	{
        public string DisplayName { get; set; } = string.Empty;
        public ICollection<BindRequestChannelUser>? BindRequestChannelUsers { get; set; }

        public ICollection<BindChannelUser>? BindChannelUsers { get; set; }

        public ICollection<Message>? Messages { get; set; }
        
        public virtual ICollection<TopSong>? TopSongs { get; set; }
        
        public virtual ICollection<TopTmdb>? TopTmdbItems { get; set; }
        
        public virtual ICollection<Recommendation> Recommendations { get; set; } = new List<Recommendation>();
        // incer poza de profil  aparent e si o pb cu bd 
        public byte[]? ProfilePicture { get; set; } // pentru fisier binar
        public string? ProfilePictureContentType { get; set; } // ex: image/png

        // data la care a fost creat user-ul
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    }
}
