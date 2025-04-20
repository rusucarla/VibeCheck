using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using VibeCheck.Models;
using VibeCheck.Server.Services;

namespace VibeCheck.Server.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly EmailService _emailService;

        public AuthController(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager, EmailService emailService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _emailService = emailService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] Models.RegisterModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = new ApplicationUser
            {
                UserName = model.Email,
                Email = model.Email,
                EmailConfirmed = false,
                DisplayName = model.DisplayName,
                PhoneNumber = model.PhoneNumber,
                TwoFactorEnabled = model.TwoFactorEnabled
            };

            var result = await _userManager.CreateAsync(user, model.Password);
            if (!result.Succeeded)
            {
                Console.WriteLine($"Eroare la inregistrare: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                return BadRequest(result.Errors);
            }
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            if (result.Succeeded)
            {
                await _userManager.AddToRoleAsync(user, "User");
            }

            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            var encodedToken = System.Net.WebUtility.UrlEncode(token);
            var confirmationLink = $"https://localhost:54894/confirm-email?userId={user.Id}&token={encodedToken}";

            Console.WriteLine($"Trimit email de confirmare la {user.Email} cu link-ul: {confirmationLink}");

            try
            {
                await _emailService.SendEmailAsync(
                    user.Email,
                    "Confirmare cont",
                    $"Click <a href='{confirmationLink}'>aici</a> pentru a confirma contul."
                );

                return Ok(new { message = "Utilizator creat! Verifica email-ul pentru confirmare." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Eroare trimitere email: {ex.Message}" });
            }
        }


        [HttpGet("confirm-email")]
        public async Task<IActionResult> ConfirmEmail(string userId, string token)
        {
            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(token))
            {
                Console.WriteLine("Eroare: userId sau token lipsa.");
                return BadRequest("Lipsesc parametrii userId sau token.");
            }

            var decodedToken = System.Net.WebUtility.UrlDecode(token);

            Console.WriteLine($"UserId primit: {userId}");
            Console.WriteLine($"Token primit (decodat): {decodedToken}");

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                Console.WriteLine("Eroare: Utilizator inexistent");
                return BadRequest("Utilizator inexistent");
            }

            var result = await _userManager.ConfirmEmailAsync(user, decodedToken);
            if (!result.Succeeded)
            {
                Console.WriteLine($"Eroare confirmare email: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                return BadRequest("Token invalid.");
            }

            Console.WriteLine("Email confirmat cu succes!");
            return Ok("Email confirmat cu succes!");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] Models.LoginModel model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null || !await _userManager.CheckPasswordAsync(user, model.Password))
            {
                return BadRequest("Invalid credentials.");
            }

            if (!await _userManager.IsEmailConfirmedAsync(user))
            {
                return BadRequest("Email is not confirmed.");
            }

            await _userManager.RemoveAuthenticationTokenAsync(user, "Default", "2FA");

            if (await _userManager.GetTwoFactorEnabledAsync(user))
            {
                var token = await _userManager.GenerateTwoFactorTokenAsync(user, "Email");

                await _emailService.SendEmailAsync(user.Email, "Cod 2FA", $"Codul tau 2FA este: {token}");

                Console.WriteLine($"Cod 2FA generat: {token} (trimis la {user.Email})");

                return Ok(new { requiresTwoFactor = true });
            }

            await _signInManager.SignInAsync(user, isPersistent: false);
            return Ok(new { message = "Autentificare reusita" });
        }

        [HttpPost("verify-2fa")]
        public async Task<IActionResult> Verify2FA([FromBody] Models.TwoFactorModel model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return BadRequest("User not found.");
            }

            var isValid = await _userManager.VerifyTwoFactorTokenAsync(user, "Email", model.Token);
            if (!isValid)
            {
                return BadRequest("Invalid 2FA code.");
            }

            await _signInManager.SignInAsync(user, isPersistent: false);
            return Ok(new { message = "Two-Factor Authentication successful!" });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            return Ok(new { message = "Logged out successfully!" });
        }
    }
}
