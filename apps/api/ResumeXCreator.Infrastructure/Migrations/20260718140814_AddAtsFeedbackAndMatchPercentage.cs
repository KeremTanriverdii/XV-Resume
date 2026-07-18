using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResumeXCreator.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAtsFeedbackAndMatchPercentage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AtsFeedback",
                table: "ResumeTranslations",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MatchPercentage",
                table: "ResumeTranslations",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AtsFeedback",
                table: "ResumeTranslations");

            migrationBuilder.DropColumn(
                name: "MatchPercentage",
                table: "ResumeTranslations");
        }
    }
}
