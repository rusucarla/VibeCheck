namespace VibeCheck.Server.DTO
{
    public class ChannelDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = String.Empty;
        public string Description { get; set; } = String.Empty;
        public List<CategoryDTO> Categories { get; set; } = new();
    }
}