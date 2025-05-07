using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using VibeCheck.Server.Models;
using VibeCheck.Server.Data;

// namespace VibeCheck.Server.Data
// {
//     public class SeeData
//     {
//         public static void Initialize(IServiceProvider _ServiceProvider)
//         {
//             using (var _Context = new ApplicationDbContext(_ServiceProvider.GetRequiredService<DbContextOptions<ApplicationDbContext>>()))
//             {
//                 if (_Context.Roles.Any())
//                 {
//                     return;
//                 }
//
//                 string _GUID_Admin_Role = Guid.NewGuid().ToString();
//                 string _GUID_User_Role = Guid.NewGuid().ToString();
//
//                 string _GUID_Admin = Guid.NewGuid().ToString();
//
//                 _Context.Roles.AddRange
//                 (
//                     new IdentityRole { Id = _GUID_Admin_Role, Name = "Admin", NormalizedName = "ADMIN" },
//                     new IdentityRole { Id = _GUID_User_Role, Name = "User", NormalizedName = "USER" }
//                 );
//
//                 var _Hasher = new PasswordHasher<ApplicationUser>();
//
//                 _Context.AppUsers.AddRange
//                 (
//                     new ApplicationUser
//                     {
//                         Id = _GUID_Admin,
//                         UserName = "admin",
//                         EmailConfirmed = true,
//                         NormalizedEmail = "ADMIN@TEST.COM",
//                         Email = "admin@test.com",
//                         NormalizedUserName = "ADMIN",
//                         PasswordHash = _Hasher.HashPassword(null, "Parola_2")
//                     }
//                 );
//
//                 _Context.AppUsers.AddRange(
//                     new ApplicationUser
//                     {
//                         Id = _GUID_User_Role,
//                         UserName = "user_default",
//                         EmailConfirmed = true,
//                         NormalizedEmail = "USER@TEST.COM",
//                         Email = "user@test.com",
//                         NormalizedUserName = "USER_DEFAULT",
//                         PasswordHash = _Hasher.HashPassword(null, "Parola_1")
//                     }
//                 );
//
//                 _Context.UserRoles.AddRange
//                 (
//                     new IdentityUserRole<string>
//                     {
//                         RoleId = _GUID_Admin_Role,
//                         UserId = _GUID_Admin
//                     }
//                 );
//
//                 _Context.SaveChanges();
//             };
//         }
//     }
// }

using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using VibeCheck.Server.Models;

namespace VibeCheck.Server.Migrations
{
    public class SeeData
    {
        public static void Initialize(IServiceProvider serviceProvider)
        {
            using var context = new ApplicationDbContext(
                serviceProvider.GetRequiredService<DbContextOptions<ApplicationDbContext>>());

            if (context.Roles.Any())
                return;

            Console.WriteLine("Seeding initial data...");

            // Roluri
            var adminRoleId = Guid.NewGuid().ToString();
            var userRoleId = Guid.NewGuid().ToString();

            context.Roles.AddRange(
                new IdentityRole { Id = adminRoleId, Name = "Admin", NormalizedName = "ADMIN" },
                new IdentityRole { Id = userRoleId, Name = "User", NormalizedName = "USER" }
            );

            var hasher = new PasswordHasher<ApplicationUser>();

            // User admin
            var adminUser = new ApplicationUser
            {
                Id = Guid.NewGuid().ToString(),
                UserName = "admin",
                NormalizedUserName = "ADMIN",
                Email = "admin@test.com",
                NormalizedEmail = "ADMIN@TEST.COM",
                EmailConfirmed = true
            };
            adminUser.PasswordHash = hasher.HashPassword(adminUser, "Parola_2");

            // User default
            var defaultUser = new ApplicationUser
            {
                Id = Guid.NewGuid().ToString(),
                UserName = "user_default",
                NormalizedUserName = "USER_DEFAULT",
                Email = "user@test.com",
                NormalizedEmail = "USER@TEST.COM",
                EmailConfirmed = true
            };
            defaultUser.PasswordHash = hasher.HashPassword(defaultUser, "Parola_1");

            context.AppUsers.AddRange(adminUser, defaultUser);

            context.UserRoles.AddRange(
                new IdentityUserRole<string>
                {
                    RoleId = adminRoleId,
                    UserId = adminUser.Id
                },
                new IdentityUserRole<string>
                {
                    RoleId = userRoleId,
                    UserId = defaultUser.Id
                }
            );

            context.SaveChanges();
        }
    }
}
