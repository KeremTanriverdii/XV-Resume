using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResumeXCreator.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDateTypesToDateTime : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("ALTER TABLE \"Experiences\" ALTER COLUMN \"StartDate\" TYPE timestamp with time zone USING (CASE WHEN \"StartDate\" IS NULL OR TRIM(\"StartDate\") = '' THEN '0001-01-01 00:00:00+00' ELSE \"StartDate\" END)::timestamp with time zone;");
            migrationBuilder.Sql("ALTER TABLE \"Experiences\" ALTER COLUMN \"EndDate\" TYPE timestamp with time zone USING (CASE WHEN \"EndDate\" IS NULL OR TRIM(\"EndDate\") = '' THEN '0001-01-01 00:00:00+00' ELSE \"EndDate\" END)::timestamp with time zone;");
            migrationBuilder.Sql("ALTER TABLE \"Educations\" ALTER COLUMN \"StartDate\" TYPE timestamp with time zone USING (CASE WHEN \"StartDate\" IS NULL OR TRIM(\"StartDate\") = '' THEN '0001-01-01 00:00:00+00' ELSE \"StartDate\" END)::timestamp with time zone;");
            migrationBuilder.Sql("ALTER TABLE \"Educations\" ALTER COLUMN \"EndDate\" TYPE timestamp with time zone USING (CASE WHEN \"EndDate\" IS NULL OR TRIM(\"EndDate\") = '' THEN '0001-01-01 00:00:00+00' ELSE \"EndDate\" END)::timestamp with time zone;");

            migrationBuilder.AlterColumn<DateTime>(
                name: "StartDate",
                table: "Experiences",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<DateTime>(
                name: "EndDate",
                table: "Experiences",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<DateTime>(
                name: "StartDate",
                table: "Educations",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<DateTime>(
                name: "EndDate",
                table: "Educations",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "StartDate",
                table: "Experiences",
                type: "text",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<string>(
                name: "EndDate",
                table: "Experiences",
                type: "text",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<string>(
                name: "StartDate",
                table: "Educations",
                type: "text",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<string>(
                name: "EndDate",
                table: "Educations",
                type: "text",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");
        }
    }
}
