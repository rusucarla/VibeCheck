namespace VibeCheck.Server.Services
{
    public class FrontendConfigService
    {
        public string FrontendUrl { get; set; }

        public FrontendConfigService(string frontendUrl)
        {
            FrontendUrl = frontendUrl;
        }
    }
}
