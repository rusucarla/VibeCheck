using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VibeCheck.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddTopSong : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TopSongs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    SpotifyTrackId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Position = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TopSongs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TopSongs_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TopSongs_UserId",
                table: "TopSongs",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TopSongs");
        }
    }
}
