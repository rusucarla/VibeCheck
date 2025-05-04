using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using VibeCheck.Models;
using VibeCheck.Server.Data;
using VibeCheck.Server.Services;
using DotNetEnv;
using VibeCheck.Server.Models;

// Pentru a folosi port-ul custom
// creati voi un fisier .env.local in Server
Env.Load(".env.local");
var defaultFrontendUrl = "https://localhost:54894";
var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? defaultFrontendUrl;
// Verificam daca exista fisierul frontend-url.json scris de frontend
if (File.Exists("frontend-url.json"))
{
    var json = File.ReadAllText("frontend-url.json");
    var obj = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(json);
    frontendUrl = obj?["frontendUrl"] ?? frontendUrl;
}
Console.WriteLine(frontendUrl);

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddRazorPages();

// Connection string
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
                      ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

// Add DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

// Add Identity (for APIs, not Razor UI)
builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
builder.Services.AddCors(options =>
{
    options.AddPolicy(MyAllowSpecificOrigins, policy =>
        policy.WithOrigins(frontendUrl)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials());
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
// For the email service (mailhog)
builder.Services.AddSingleton<EmailService>();
// For the unique frontend URL
builder.Services.AddSingleton(new FrontendConfigService(frontendUrl));
// For the music side of recomendations - Spotify
builder.Services.Configure<SpotifyOptions>(builder.Configuration.GetSection("Spotify"));
builder.Services.AddHttpClient();
builder.Services.AddScoped<SpotifyService>();
builder.Services.Configure<TmdbOptions>(builder.Configuration.GetSection("TMDb"));
builder.Services.AddScoped<TmdbService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseCors(MyAllowSpecificOrigins);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapRazorPages(); 
app.MapFallbackToFile("/index.html");

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    SeeData.Initialize(services);
}


app.Run();

//// Add controllers
//builder.Services.AddControllers();

//// Optional: Swagger (useful for testing your endpoints)
//builder.Services.AddEndpointsApiExplorer();
//builder.Services.AddSwaggerGen();

//var app = builder.Build();

//// Seed data if needed
//using (var scope = app.Services.CreateScope())
//{
//    var services = scope.ServiceProvider;

//    try
//    {
//        SeeData.Initialize(services); // Make sure this is a static method
//    }
//    catch (Exception ex)
//    {
//        var logger = services.GetRequiredService<ILogger<Program>>();
//        logger.LogError(ex, "An error occurred seeding the DB.");
//    }
//}

//// Configure middleware
//if (app.Environment.IsDevelopment())
//{
//    app.UseSwagger();
//    app.UseSwaggerUI();
//}
//else
//{
//    app.UseExceptionHandler("/error");
//    app.UseHsts();
//}

//app.UseHttpsRedirection();
//app.UseStaticFiles();
//app.UseRouting();

//app.UseAuthentication();
//app.UseAuthorization();

//app.MapControllers();

//app.Run();
