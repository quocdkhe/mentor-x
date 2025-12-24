using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddMentorCoreTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "mentor_profiles",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    biography = table.Column<string>(type: "text", nullable: false),
                    price_per_hour = table.Column<decimal>(type: "numeric", nullable: false),
                    avg_rating = table.Column<double>(type: "double precision", nullable: false, defaultValue: 0.0),
                    total_ratings = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("mentor_profiles_pkey", x => x.id);
                    table.ForeignKey(
                        name: "fk_mentor_profiles_user",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "skills",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    name = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("skills_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "mentor_reviews",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    mentor_profile_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    rating = table.Column<int>(type: "integer", nullable: false),
                    comment = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("mentor_reviews_pkey", x => x.id);
                    table.ForeignKey(
                        name: "fk_mentor_reviews_mentor_profile",
                        column: x => x.mentor_profile_id,
                        principalTable: "mentor_profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_mentor_reviews_user",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "mentor_skill",
                columns: table => new
                {
                    mentor_profile_id = table.Column<Guid>(type: "uuid", nullable: false),
                    skill_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("mentor_skill_pkey", x => new { x.mentor_profile_id, x.skill_id });
                    table.ForeignKey(
                        name: "fk_mentor_skill_mentor_profile",
                        column: x => x.mentor_profile_id,
                        principalTable: "mentor_profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_mentor_skill_skill",
                        column: x => x.skill_id,
                        principalTable: "skills",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "mentor_profiles_user_id_key",
                table: "mentor_profiles",
                column: "user_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_mentor_reviews_mentor_profile_id",
                table: "mentor_reviews",
                column: "mentor_profile_id");

            migrationBuilder.CreateIndex(
                name: "idx_mentor_reviews_user_id",
                table: "mentor_reviews",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "idx_mentor_skill_skill_id",
                table: "mentor_skill",
                column: "skill_id");

            migrationBuilder.CreateIndex(
                name: "skills_name_key",
                table: "skills",
                column: "name",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "mentor_reviews");

            migrationBuilder.DropTable(
                name: "mentor_skill");

            migrationBuilder.DropTable(
                name: "mentor_profiles");

            migrationBuilder.DropTable(
                name: "skills");
        }
    }
}
