using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VibeCheck.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddDisplayNameToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ChannelRequests");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Channels",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.CreateTable(
                name: "Requests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RequestType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ProcessedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Requests", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BindRequestChannelUserEntries",
                columns: table => new
                {
                    ChannelId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    RequestId = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BindRequestChannelUserEntries", x => new { x.ChannelId, x.UserId, x.RequestId });
                    table.ForeignKey(
                        name: "FK_BindRequestChannelUserEntries_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BindRequestChannelUserEntries_Channels_ChannelId",
                        column: x => x.ChannelId,
                        principalTable: "Channels",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BindRequestChannelUserEntries_Requests_RequestId",
                        column: x => x.RequestId,
                        principalTable: "Requests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BindRequestChannelUserEntries_RequestId",
                table: "BindRequestChannelUserEntries",
                column: "RequestId");

            migrationBuilder.CreateIndex(
                name: "IX_BindRequestChannelUserEntries_UserId",
                table: "BindRequestChannelUserEntries",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BindRequestChannelUserEntries");

            migrationBuilder.DropTable(
                name: "Requests");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Channels",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500);

            migrationBuilder.CreateTable(
                name: "ChannelRequests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ChannelId = table.Column<int>(type: "int", nullable: false),
                    RequesterId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    TargetUserId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ProcessedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RequestType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChannelRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChannelRequests_AspNetUsers_RequesterId",
                        column: x => x.RequesterId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ChannelRequests_AspNetUsers_TargetUserId",
                        column: x => x.TargetUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ChannelRequests_Channels_ChannelId",
                        column: x => x.ChannelId,
                        principalTable: "Channels",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChannelRequests_ChannelId",
                table: "ChannelRequests",
                column: "ChannelId");

            migrationBuilder.CreateIndex(
                name: "IX_ChannelRequests_RequesterId",
                table: "ChannelRequests",
                column: "RequesterId");

            migrationBuilder.CreateIndex(
                name: "IX_ChannelRequests_TargetUserId",
                table: "ChannelRequests",
                column: "TargetUserId");
        }
    }
}
