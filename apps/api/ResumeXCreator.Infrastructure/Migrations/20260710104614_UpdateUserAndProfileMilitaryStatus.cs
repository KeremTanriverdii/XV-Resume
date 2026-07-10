using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResumeXCreator.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateUserAndProfileMilitaryStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PostponedTitle",
                table: "Users");

            migrationBuilder.AddColumn<DateTime>(
                name: "MilitaryPostponedUntil",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MilitaryStatus",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<List<string>>(
                name: "Languages",
                table: "Profiles",
                type: "text[]",
                nullable: false,
                defaultValueSql: "'{}'");

            migrationBuilder.AddColumn<DateTime>(
                name: "MilitaryPostponedUntil",
                table: "Profiles",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MilitaryStatus",
                table: "Profiles",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MilitaryPostponedUntil",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "MilitaryStatus",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Languages",
                table: "Profiles");

            migrationBuilder.DropColumn(
                name: "MilitaryPostponedUntil",
                table: "Profiles");

            migrationBuilder.DropColumn(
                name: "MilitaryStatus",
                table: "Profiles");

            migrationBuilder.AddColumn<string>(
                name: "PostponedTitle",
                table: "Users",
                type: "text",
                nullable: true);
        }
    }
}
