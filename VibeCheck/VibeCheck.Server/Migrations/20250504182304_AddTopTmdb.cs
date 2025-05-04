using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VibeCheck.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddTopTmdb : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TopTmdbItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    TmdbId = table.Column<int>(type: "int", nullable: false),
                    Position = table.Column<int>(type: "int", nullable: false),
                    MediaType = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TopTmdbItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TopTmdbItems_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TopTmdbItems_UserId",
                table: "TopTmdbItems",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TopTmdbItems");
        }
    }
}
