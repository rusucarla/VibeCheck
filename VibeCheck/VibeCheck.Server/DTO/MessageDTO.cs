// VibeCheck.Server/DTO/MessageDTO.cs
namespace VibeCheck.Server.DTO
{
    public class CreateMessageDto
    {
        public string? Content { get; set; }
        public string? FilePath { get; set; }
        public string? FileType { get; set; }
    }

    // Adaugă această clasă pentru răspunsul API-ului
    public class MessageResponseDto
    {
        public int Id { get; set; }
        public string? Content { get; set; }
        public string? FilePath { get; set; }
        public string? FileType { get; set; }
        public DateTime Date { get; set; }
        public string UserId { get; set; }
        public string UserName { get; set; } // Numele de utilizator
        public int ChannelId { get; set; }
    }
}
