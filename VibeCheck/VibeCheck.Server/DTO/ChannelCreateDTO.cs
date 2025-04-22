namespace VibeCheck.Server.DTO
{
    public class ChannelCreateDTO
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int? CategoryId { get; set; }
        public CategoryCreateDTO Category { get; set; }
    }
}
