using Microsoft.Extensions.Configuration;
using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace VibeCheck.Server.Services
{
    public class EmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            var smtpServer = _config["EmailSettings:SmtpServer"];
            var smtpPort = int.Parse(_config["EmailSettings:SmtpPort"]);
            var fromEmail = _config["EmailSettings:FromEmail"];
            var fromName = _config["EmailSettings:FromName"];
            var enableSsl = bool.Parse(_config["EmailSettings:EnableSsl"]);

            if (string.IsNullOrEmpty(smtpServer) || smtpPort == 0 || string.IsNullOrEmpty(fromEmail))
            {
                throw new Exception("SMTP configuration is missing!");
            }

            var mailMessage = new MailMessage
            {
                From = new MailAddress(fromEmail, fromName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };

            mailMessage.To.Add(to);

            using (var smtpClient = new SmtpClient(smtpServer, smtpPort))
            {
                smtpClient.EnableSsl = enableSsl;
                smtpClient.UseDefaultCredentials = false;
                smtpClient.Credentials = new NetworkCredential(); // MailHog nu are nevoie de autentificare

                try
                {
                    await smtpClient.SendMailAsync(mailMessage);
                    Console.WriteLine($"Email trimis catre {to}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Eroare trimitere email: {ex.Message}");
                    throw;
                }
            }
        }
    }
}
