using System.ComponentModel.DataAnnotations;

namespace VibeCheck.Models
{
	public class BindChannelUser
	{
        public int ChannelId { get; set; }
 
 		public string? UserId { get; set; }
 
 		[Required]
 		public string? Role { get; set; }
 
 		public virtual Channel? Channel { get; set; }
 
 		public virtual ApplicationUser? User { get; set; }
    }
}
