using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdateMentorProfile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Company",
                table: "mentor_profiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Position",
                table: "mentor_profiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "mentor_profiles",
                type: "text",
                nullable: false,
                defaultValue: "pending");

            migrationBuilder.AddColumn<int>(
                name: "YearOfExperience",
                table: "mentor_profiles",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Company",
                table: "mentor_profiles");

            migrationBuilder.DropColumn(
                name: "Position",
                table: "mentor_profiles");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "mentor_profiles");

            migrationBuilder.DropColumn(
                name: "YearOfExperience",
                table: "mentor_profiles");
        }
    }
}
