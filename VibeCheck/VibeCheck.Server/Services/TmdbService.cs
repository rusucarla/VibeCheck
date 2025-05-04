using Microsoft.Extensions.Options;
using System.Net.Http.Headers;
using System.Text.Json;
using VibeCheck.Server.DTO;
using VibeCheck.Server.Models;


namespace VibeCheck.Server.Services
{
    public class TmdbService
    {
        private readonly HttpClient _httpClient;
        private readonly TmdbOptions _options;

        public TmdbService(HttpClient httpClient, IOptions<TmdbOptions> options)
        {
            _httpClient = httpClient;
            _options = options.Value;
            _httpClient.BaseAddress = new Uri("https://api.themoviedb.org/3/");
            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", _options.ApiReadAccessToken.Replace("Bearer ", ""));
        }

        public async Task<List<TmdbDTO>> SearchAsync(string query)
        {
            var response = await _httpClient.GetAsync($"search/multi?query={Uri.EscapeDataString(query)}&include_adult=false");
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            var data = JsonSerializer.Deserialize<JsonElement>(json);

            var results = new List<TmdbDTO>();

            foreach (var item in data.GetProperty("results").EnumerateArray())
            {
                if (item.TryGetProperty("media_type", out var type) &&
                    (type.GetString() == "movie" || type.GetString() == "tv"))
                {
                    var title = type.GetString() == "movie"
                        ? item.GetProperty("title").GetString()
                        : item.GetProperty("name").GetString();

                    results.Add(new TmdbDTO
                    {
                        Id = item.GetProperty("id").GetInt32(),
                        Title = title ?? "Untitled",
                        PosterUrl = item.GetProperty("poster_path").GetString() is string poster
                            ? $"https://image.tmdb.org/t/p/w500{poster}"
                            : null,
                        MediaType = type.GetString()
                    });
                }
            }

            return results;
        }
        
        public async Task<TmdbDTO?> GetByIdAsync(int id, string mediaType)
        {
            var endpoint = mediaType.ToLower() switch
            {
                "movie" => $"movie/{id}",
                "tv" => $"tv/{id}",
                _ => null
            };

            if (endpoint == null) return null;

            var response = await _httpClient.GetAsync(endpoint);
            if (!response.IsSuccessStatusCode) return null;

            var json = await response.Content.ReadAsStringAsync();
            var data = JsonSerializer.Deserialize<JsonElement>(json);

            return new TmdbDTO
            {
                Id = data.GetProperty("id").GetInt32(),
                Title = mediaType == "movie"
                    ? data.GetProperty("title").GetString() ?? ""
                    : data.GetProperty("name").GetString() ?? "",
                PosterUrl = data.TryGetProperty("poster_path", out var poster) && poster.ValueKind != JsonValueKind.Null
                    ? $"https://image.tmdb.org/t/p/w500{poster.GetString()}"
                    : null,
                MediaType = mediaType
            };
        }
        
        public async Task<string?> GetMediaTypeByIdAsync(int tmdbId)
        {
            var movieResponse = await _httpClient.GetAsync($"movie/{tmdbId}");
            if (movieResponse.IsSuccessStatusCode)
            {
                var json = await movieResponse.Content.ReadAsStringAsync();
                var data = JsonSerializer.Deserialize<JsonElement>(json);
                if (data.TryGetProperty("title", out var title) && title.ValueKind == JsonValueKind.String)
                {
                    return "movie";
                }
            }

            var tvResponse = await _httpClient.GetAsync($"tv/{tmdbId}");
            if (tvResponse.IsSuccessStatusCode)
            {
                var json = await tvResponse.Content.ReadAsStringAsync();
                var data = JsonSerializer.Deserialize<JsonElement>(json);
                if (data.TryGetProperty("name", out var name) && name.ValueKind == JsonValueKind.String)
                {
                    return "tv";
                }
            }

            return null;
        }
    }
}