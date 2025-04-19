using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using VibeCheck.Models;
using VibeCheck.Models;
using VibeCheck.Server.Models;

namespace VibeCheck.Server.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions options)
        : base(options)
        { }

        public DbSet<ApplicationUser> AppUsers { get; set; }
        public DbSet<BindChannelUser> BindChannelUserEntries { get; set; }
        public DbSet<ChannelRequest> ChannelRequests { get; set; }
        public DbSet<Channel> Channels { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Message> Messages { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<BindChannelUser>().HasKey(ac => new { ac.ChannelId, ac.UserId });

            builder.Entity<BindChannelUser>().HasOne(ac => ac.Channel).WithMany(ac => ac.BindChannelUser).HasForeignKey(ac => ac.ChannelId);
            builder.Entity<BindChannelUser>().HasOne(ac => ac.User).WithMany(ac => ac.BindChannelUsers).HasForeignKey(ac => ac.UserId);
        }
    }

}