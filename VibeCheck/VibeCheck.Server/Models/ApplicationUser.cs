using Microsoft.AspNetCore.Identity;

namespace VibeCheck.Models
{
	public class ApplicationUser : IdentityUser
	{
        public required string DisplayName { get; set; } = string.Empty;
        public ICollection<BindRequestChannelUser>? BindRequestChannelUsers { get; set; }

        public ICollection<BindChannelUser>? BindChannelUsers { get; set; }

        public ICollection<Message>? Messages { get; set; }
    }
}
