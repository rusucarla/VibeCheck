using System.ComponentModel.DataAnnotations;
using VibeCheck.Server.Models;

namespace VibeCheck.Server.Models
{
	public class Channel
	{
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "Channels are required to have a name!")]
        [MinLength(3, ErrorMessage = "Channel name must contain at least 3 characters!")]
        [MaxLength(20, ErrorMessage = "Channel name must contain at most 20 characters!")]
        public string? Name { get; set; }

        [Required(ErrorMessage = "Channels are required to have a description!")]
        [MinLength(3, ErrorMessage = "Channel description must contain at least 3 characters!")]
        [MaxLength(50, ErrorMessage = "Channel description must contain at most 50 characters!")]
        public string? Description { get; set; }

        // [Required(ErrorMessage = "Channels are required to have a category!")]
        // public int CategoryId { get; set; }
        //
        // public virtual Category? Category { get; set; }
        public virtual ICollection<BindCategoryChannel> BindCategoryChannels { get; set; } = new List<BindCategoryChannel>();

        public virtual ICollection<Message>? Messages { get; set; }

        public virtual ICollection<BindChannelUser>? BindChannelUser { get; set; }

        public virtual ICollection<BindRequestChannelUser>? BindRequestChannelUser { get; set; }
        
        public virtual ICollection<Recommendation>? Recommendations { get; set; }
    }
}
