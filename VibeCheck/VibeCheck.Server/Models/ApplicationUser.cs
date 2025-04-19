using Microsoft.AspNetCore.Identity;

namespace VibeCheck.Models
{
	public class ApplicationUser : IdentityUser
	{
        public string DisplayName { get; set; } = string.Empty;

        public ICollection<BindChannelUser>? BindChannelUsers { get; set; }

        public ICollection<Message>? Messages { get; set; }
    }
}
