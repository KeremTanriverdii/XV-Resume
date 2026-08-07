using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResumeXCreator.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCriticalAndRecommendedMissingSkillsColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Use idempotent SQL because columns may already exist from earlier raw SQL migration
            migrationBuilder.Sql(
                """
                ALTER TABLE "ResumeTranslations" ADD COLUMN IF NOT EXISTS "CriticalMissingSkillsJson" text;
                ALTER TABLE "ResumeTranslations" ADD COLUMN IF NOT EXISTS "MatchedSkillsJson" text;
                ALTER TABLE "ResumeTranslations" ADD COLUMN IF NOT EXISTS "MissingSkillsJson" text;
                ALTER TABLE "ResumeTranslations" ADD COLUMN IF NOT EXISTS "RecommendedMissingSkillsJson" text;
                DO $$ BEGIN
                    ALTER TABLE "Profiles" ALTER COLUMN "PhotoUrl" TYPE text;
                EXCEPTION WHEN others THEN NULL;
                END $$;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CriticalMissingSkillsJson",
                table: "ResumeTranslations");

            migrationBuilder.DropColumn(
                name: "MatchedSkillsJson",
                table: "ResumeTranslations");

            migrationBuilder.DropColumn(
                name: "MissingSkillsJson",
                table: "ResumeTranslations");

            migrationBuilder.DropColumn(
                name: "RecommendedMissingSkillsJson",
                table: "ResumeTranslations");

            migrationBuilder.AlterColumn<string>(
                name: "PhotoUrl",
                table: "Profiles",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);
        }
    }
}
