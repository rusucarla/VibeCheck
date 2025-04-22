namespace VibeCheck.Server.DTO
{
    public class ChannelDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public CategoryDTO Category { get; set; }
    }
}