using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VibeCheck.Server.Migrations
{
    /// <inheritdoc />
    public partial class RemoveDisplayNameFromUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE AspNetUsers
                SET UserName = DisplayName,
                    NormalizedUserName = UPPER(DisplayName)
                WHERE UserName IS NULL;
            ");
            
            migrationBuilder.DropColumn(
                name: "DisplayName",
                table: "AspNetUsers");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DisplayName",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
