using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using VibeCheck.Models;
using VibeCheck.Server.Data;
using VibeCheck.Server.Services;

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
        policy.WithOrigins("https://localhost:54894")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials());
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<EmailService>();

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
