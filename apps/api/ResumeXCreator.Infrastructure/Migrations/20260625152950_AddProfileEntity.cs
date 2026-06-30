using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResumeXCreator.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProfileEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Resumes_Users_UserId",
                table: "Resumes");

            migrationBuilder.DropIndex(
                name: "IX_Resumes_UserId",
                table: "Resumes");

            migrationBuilder.DropColumn(
                name: "SocialLinks",
                table: "ResumeTranslations");

            migrationBuilder.DropColumn(
                name: "SocialLinks",
                table: "Resumes");

            migrationBuilder.DropColumn(
                name: "Title",
                table: "Resumes");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Resumes");

            migrationBuilder.AddColumn<Guid>(
                name: "ProfileId",
                table: "Resumes",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Profiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: true),
                    ProfileName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    FullName = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Summary = table.Column<string>(type: "text", nullable: false),
                    ExperienceJson = table.Column<string>(type: "text", nullable: false),
                    EducationJson = table.Column<string>(type: "text", nullable: false),
                    Skills = table.Column<List<string>>(type: "text[]", nullable: false),
                    SocialLinks = table.Column<List<string>>(type: "text[]", nullable: false),
                    PhotoUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ShowPhoto = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Profiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Profiles_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Resumes_ProfileId",
                table: "Resumes",
                column: "ProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_Profiles_UserId",
                table: "Profiles",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Resumes_Profiles_ProfileId",
                table: "Resumes",
                column: "ProfileId",
                principalTable: "Profiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Resumes_Profiles_ProfileId",
                table: "Resumes");

            migrationBuilder.DropTable(
                name: "Profiles");

            migrationBuilder.DropIndex(
                name: "IX_Resumes_ProfileId",
                table: "Resumes");

            migrationBuilder.DropColumn(
                name: "ProfileId",
                table: "Resumes");

            migrationBuilder.AddColumn<List<string>>(
                name: "SocialLinks",
                table: "ResumeTranslations",
                type: "text[]",
                nullable: false);

            migrationBuilder.AddColumn<List<string>>(
                name: "SocialLinks",
                table: "Resumes",
                type: "text[]",
                nullable: false);

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "Resumes",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "Resumes",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Resumes_UserId",
                table: "Resumes",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Resumes_Users_UserId",
                table: "Resumes",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
