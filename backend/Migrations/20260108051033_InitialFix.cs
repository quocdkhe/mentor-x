using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialFix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "status",
                table: "mentor_profiles",
                type: "text",
                nullable: false
                ); // bạn có thể đổi defaultValue

            migrationBuilder.AddColumn<string>(
                name: "position",
                table: "mentor_profiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "company",
                table: "mentor_profiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "years_of_experience",
                table: "mentor_profiles",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }


        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "status",
                table: "mentor_profiles");

            migrationBuilder.DropColumn(
                name: "position",
                table: "mentor_profiles");

            migrationBuilder.DropColumn(
                name: "company",
                table: "mentor_profiles");

            migrationBuilder.DropColumn(
                name: "years_of_experience",
                table: "mentor_profiles");
        }

    }
}
