namespace VibeCheck.Server.Models
{
    public class RegisterModel
    {
        public required string Email { get; set; }
        public required string Username { get; set; }
        public required string Password { get; set; }
        public string? PhoneNumber { get; set; }
        public bool TwoFactorEnabled { get; set; }
        //public string? DisplayName { get; set; }
    }
}
