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

    }
}
