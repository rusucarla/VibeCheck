using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VibeCheck.Server.Migrations
{
    /// <inheritdoc />
    public partial class ChannelcategoriesManyToMany : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Channels_Categories_CategoryId",
                table: "Channels");

            migrationBuilder.DropIndex(
                name: "IX_Channels_CategoryId",
                table: "Channels");

            migrationBuilder.DropColumn(
                name: "CategoryId",
                table: "Channels");

            migrationBuilder.CreateTable(
                name: "BindCategoryChannelEntries",
                columns: table => new
                {
                    CategoryId = table.Column<int>(type: "int", nullable: false),
                    ChannelId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BindCategoryChannelEntries", x => new { x.CategoryId, x.ChannelId });
                    table.ForeignKey(
                        name: "FK_BindCategoryChannelEntries_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BindCategoryChannelEntries_Channels_ChannelId",
                        column: x => x.ChannelId,
                        principalTable: "Channels",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BindCategoryChannelEntries_ChannelId",
                table: "BindCategoryChannelEntries",
                column: "ChannelId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BindCategoryChannelEntries");

            migrationBuilder.AddColumn<int>(
                name: "CategoryId",
                table: "Channels",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Channels_CategoryId",
                table: "Channels",
                column: "CategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Channels_Categories_CategoryId",
                table: "Channels",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
