using VibeCheck.Server.Models;

namespace VibeCheck.Server.Models
{

    public class BindCategoryChannel
    {
        public int CategoryId { get; set; }
        public int ChannelId { get; set; }

        public Category? Category { get; set; }
        public Channel? Channel { get; set; }
    }
}