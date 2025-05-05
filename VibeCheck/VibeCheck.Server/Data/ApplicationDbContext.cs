using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using VibeCheck.Server.Models;
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
        public DbSet<BindRequestChannelUser> BindRequestChannelUserEntries { get; set; }
        public DbSet<BindCategoryChannel> BindCategoryChannelEntries { get; set; }
        public DbSet<Channel> Channels { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Request> Requests { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<TopSong> TopSongs { get; set; }
        public DbSet<TopTmdb> TopTmdbItems { get; set; }
        public DbSet<Recommendation> Recommendations { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            
            builder.Entity<BindCategoryChannel>().HasKey(b => new { b.CategoryId, b.ChannelId });

            builder.Entity<BindCategoryChannel>()
                .HasOne(b => b.Category)
                .WithMany(c => c.BindCategoryChannels)
                .HasForeignKey(b => b.CategoryId);

            builder.Entity<BindCategoryChannel>()
                .HasOne(b => b.Channel)
                .WithMany(c => c.BindCategoryChannels)
                .HasForeignKey(b => b.ChannelId);

            builder.Entity<BindChannelUser>().HasKey(ac => new { ac.ChannelId, ac.UserId });
            builder.Entity<BindChannelUser>().HasOne(ac => ac.Channel).WithMany(ac => ac.BindChannelUser).HasForeignKey(ac => ac.ChannelId);
            builder.Entity<BindChannelUser>().HasOne(ac => ac.User).WithMany(ac => ac.BindChannelUsers).HasForeignKey(ac => ac.UserId);

            builder.Entity<BindRequestChannelUser>().HasKey(ac => new { ac.ChannelId, ac.UserId, ac.RequestId });
            builder.Entity<BindRequestChannelUser>().HasOne(ac => ac.Channel).WithMany(ac => ac.BindRequestChannelUser).HasForeignKey(ac => ac.ChannelId);
            builder.Entity<BindRequestChannelUser>().HasOne(ac => ac.User).WithMany(ac => ac.BindRequestChannelUsers).HasForeignKey(ac => ac.UserId);
            builder.Entity<BindRequestChannelUser>().HasOne(ac => ac.Request).WithMany(ac => ac.BindRequestChannelUsers).HasForeignKey(ac => ac.RequestId);

            builder.Entity<Channel>().Property(c => c.Description).HasMaxLength(500);
            
            builder.Entity<TopSong>()
                .HasOne(ts => ts.User)
                .WithMany(u => u.TopSongs)
                .HasForeignKey(ts => ts.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<TopSong>()
                .Property(ts => ts.SpotifyTrackId)
                .IsRequired();

            builder.Entity<TopSong>()
                .Property(ts => ts.Position)
                .IsRequired();
            
            builder.Entity<TopTmdb>()
                .HasOne(t => t.User)
                .WithMany(u => u.TopTmdbItems)
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.Entity<TopTmdb>()
                .Property(ts => ts.TmdbId)
                .IsRequired();

            builder.Entity<TopTmdb>()
                .Property(ts => ts.Position)
                .IsRequired();
            
            builder.Entity<Recommendation>()
                .HasOne(r => r.User)
                .WithMany(u => u.Recommendations)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Recommendation>()
                .HasOne(r => r.Channel)
                .WithMany(c => c.Recommendations)
                .HasForeignKey(r => r.ChannelId)
                .OnDelete(DeleteBehavior.Cascade);

        }
    }

}