using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResumeXCreator.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserSubscriptionFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PaddleCustomerId",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "SubscriptionEndsAt",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SubscriptionsStatus",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "TrialsEndsAt",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PaddleCustomerId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "SubscriptionEndsAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "SubscriptionsStatus",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "TrialsEndsAt",
                table: "Users");
        }
    }
}
