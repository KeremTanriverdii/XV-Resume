using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResumeXCreator.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLanguagesAndProjectsToResumeTranslation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LanguagesHtml",
                table: "ResumeTranslations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ProjectsHtml",
                table: "ResumeTranslations",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LanguagesHtml",
                table: "ResumeTranslations");

            migrationBuilder.DropColumn(
                name: "ProjectsHtml",
                table: "ResumeTranslations");
        }
    }
}
