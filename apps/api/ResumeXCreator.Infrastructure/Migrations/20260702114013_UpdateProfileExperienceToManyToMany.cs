using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResumeXCreator.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateProfileExperienceToManyToMany : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "Experiences",
                type: "text",
                nullable: true);

            // Copy UserId from associated Profiles
            migrationBuilder.Sql("UPDATE \"Experiences\" SET \"UserId\" = p.\"UserId\" FROM \"Profiles\" p WHERE \"Experiences\".\"ProfileId\" = p.\"Id\";");

            migrationBuilder.CreateTable(
                name: "ProfileExperiences",
                columns: table => new
                {
                    ProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    ExperienceId = table.Column<Guid>(type: "uuid", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProfileExperiences", x => new { x.ProfileId, x.ExperienceId });
                    table.ForeignKey(
                        name: "FK_ProfileExperiences_Experiences_ExperienceId",
                        column: x => x.ExperienceId,
                        principalTable: "Experiences",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProfileExperiences_Profiles_ProfileId",
                        column: x => x.ProfileId,
                        principalTable: "Profiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            // Copy existing linkages to ProfileExperiences
            migrationBuilder.Sql("INSERT INTO \"ProfileExperiences\" (\"ProfileId\", \"ExperienceId\", \"SortOrder\") SELECT \"ProfileId\", \"Id\", 0 FROM \"Experiences\";");

            migrationBuilder.DropForeignKey(
                name: "FK_Experiences_Profiles_ProfileId",
                table: "Experiences");

            migrationBuilder.DropIndex(
                name: "IX_Experiences_ProfileId",
                table: "Experiences");

            migrationBuilder.DropColumn(
                name: "ProfileId",
                table: "Experiences");

            migrationBuilder.CreateIndex(
                name: "IX_Experiences_UserId",
                table: "Experiences",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfileExperiences_ExperienceId",
                table: "ProfileExperiences",
                column: "ExperienceId");

            migrationBuilder.AddForeignKey(
                name: "FK_Experiences_Users_UserId",
                table: "Experiences",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Experiences_Users_UserId",
                table: "Experiences");

            migrationBuilder.DropTable(
                name: "ProfileExperiences");

            migrationBuilder.DropIndex(
                name: "IX_Experiences_UserId",
                table: "Experiences");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Experiences");

            migrationBuilder.AddColumn<Guid>(
                name: "ProfileId",
                table: "Experiences",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Experiences_ProfileId",
                table: "Experiences",
                column: "ProfileId");

            migrationBuilder.AddForeignKey(
                name: "FK_Experiences_Profiles_ProfileId",
                table: "Experiences",
                column: "ProfileId",
                principalTable: "Profiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
