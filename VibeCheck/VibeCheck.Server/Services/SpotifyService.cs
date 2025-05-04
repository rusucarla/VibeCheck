using Microsoft.Extensions.Options;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using VibeCheck.Server.DTO;
using VibeCheck.Server.Models;

namespace VibeCheck.Server.Services
{
    public class SpotifyService
    {
        private readonly HttpClient _httpClient;
        private readonly SpotifyOptions _options;
        private string? _accessToken;

        public SpotifyService(IHttpClientFactory httpClientFactory, IOptions<SpotifyOptions> options)
        {
            _httpClient = httpClientFactory.CreateClient();
            _options = options.Value;
        }

        private async Task AuthenticateAsync()
        {
            if (!string.IsNullOrEmpty(_accessToken)) return;

            var clientCredentials = $"{_options.ClientId}:{_options.ClientSecret}";
            var encodedCredentials = Convert.ToBase64String(Encoding.UTF8.GetBytes(clientCredentials));

            var request = new HttpRequestMessage(HttpMethod.Post, "https://accounts.spotify.com/api/token");
            request.Headers.Authorization = new AuthenticationHeaderValue("Basic", encodedCredentials);
            request.Content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                { "grant_type", "client_credentials" }
            });

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            var data = JsonSerializer.Deserialize<JsonElement>(json);
            _accessToken = data.GetProperty("access_token").GetString();
        }

        public async Task<List<SpotifyTrackDTO>> SearchTracksAsync(string query)
        {
            await AuthenticateAsync();

            var request = new HttpRequestMessage(HttpMethod.Get,
                $"https://api.spotify.com/v1/search?q={Uri.EscapeDataString(query)}&type=track&limit=10");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _accessToken);

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            var data = JsonSerializer.Deserialize<JsonElement>(json);

            var tracks = new List<SpotifyTrackDTO>();

            foreach (var item in data.GetProperty("tracks").GetProperty("items").EnumerateArray())
            {
                tracks.Add(new SpotifyTrackDTO
                {
                    Id = item.GetProperty("id").GetString(),
                    Name = item.GetProperty("name").GetString(),
                    Artist = item.GetProperty("artists")[0].GetProperty("name").GetString(),
                    ImageUrl = item.GetProperty("album").GetProperty("images")[0].GetProperty("url").GetString()
                });
            }

            return tracks;
        }

        public async Task<SpotifyTrackDTO?> GetTrackByIdAsync(string id)
        {
            await AuthenticateAsync();

            var request = new HttpRequestMessage(HttpMethod.Get, $"https://api.spotify.com/v1/tracks/{id}");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _accessToken);

            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode) return null;

            var json = await response.Content.ReadAsStringAsync();
            var data = JsonSerializer.Deserialize<JsonElement>(json);

            return new SpotifyTrackDTO
            {
                Id = data.GetProperty("id").GetString(),
                Name = data.GetProperty("name").GetString(),
                Artist = data.GetProperty("artists")[0].GetProperty("name").GetString(),
                ImageUrl = data.GetProperty("album").GetProperty("images")[0].GetProperty("url").GetString()
            };
        }
    }
}