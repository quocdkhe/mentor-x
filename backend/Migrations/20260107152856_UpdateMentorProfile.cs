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
                name: "company",
                table: "mentor_profiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "position",
                table: "mentor_profiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "status",
                table: "mentor_profiles",
                type: "text",
                nullable: false,
                defaultValue: "pending");

            migrationBuilder.AddColumn<int>(
                name: "yearOfExperience",
                table: "mentor_profiles",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "company",
                table: "mentor_profiles");

            migrationBuilder.DropColumn(
                name: "position",
                table: "mentor_profiles");

            migrationBuilder.DropColumn(
                name: "status",
                table: "mentor_profiles");

            migrationBuilder.DropColumn(
                name: "yearOfExperience",
                table: "mentor_profiles");
        }
    }
}
