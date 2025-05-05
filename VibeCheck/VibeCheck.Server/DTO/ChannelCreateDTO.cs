namespace VibeCheck.Server.DTO
{
    public class ChannelCreateDTO
    {
        public string Name { get; set; } = String.Empty;       // required
        public string Description { get; set; } = String.Empty;   // required
        public List<int> CategoryIds { get; set; } = new();
    }
}
