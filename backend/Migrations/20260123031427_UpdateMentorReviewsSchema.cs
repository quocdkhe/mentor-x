using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdateMentorReviewsSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_mentor_reviews_mentor_profile",
                table: "mentor_reviews");

            migrationBuilder.DropForeignKey(
                name: "fk_mentor_reviews_user",
                table: "mentor_reviews");

            migrationBuilder.DropIndex(
                name: "idx_mentor_reviews_mentor_profile_id",
                table: "mentor_reviews");

            migrationBuilder.DropIndex(
                name: "idx_mentor_reviews_user_id",
                table: "mentor_reviews");

            migrationBuilder.DropColumn(
                name: "mentor_profile_id",
                table: "mentor_reviews");

            migrationBuilder.DropColumn(
                name: "user_id",
                table: "mentor_reviews");

            migrationBuilder.AddColumn<Guid>(
                name: "mentor_id",
                table: "mentor_reviews",
                type: "uuid",
                nullable: false,

                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "appointment_id",
                table: "mentor_reviews",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "mentee_id",
                table: "mentor_reviews",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "mentor_review_upvotes",
                columns: table => new
                {
                    mentor_review_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_mentor_review_upvotes", x => new { x.mentor_review_id, x.user_id });
                    table.ForeignKey(
                        name: "fk_mentor_review_upvotes_review",
                        column: x => x.mentor_review_id,
                        principalTable: "mentor_reviews",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_mentor_review_upvotes_user",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "idx_mentor_reviews_mentor_id",
                table: "mentor_reviews",
                column: "mentor_id");

            migrationBuilder.CreateIndex(
                name: "idx_mentor_reviews_appointment_id",
                table: "mentor_reviews",
                column: "appointment_id");

            migrationBuilder.CreateIndex(
                name: "idx_mentor_reviews_mentee_id",
                table: "mentor_reviews",
                column: "mentee_id");

            migrationBuilder.CreateIndex(
                name: "IX_mentor_review_upvotes_user_id",
                table: "mentor_review_upvotes",
                column: "user_id");

            migrationBuilder.AddForeignKey(
                name: "fk_mentor_reviews_appointment",
                table: "mentor_reviews",
                column: "appointment_id",
                principalTable: "appointments",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_mentor_reviews_mentee",
                table: "mentor_reviews",
                column: "mentee_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_mentor_reviews_mentor",
                table: "mentor_reviews",
                column: "mentor_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_mentor_reviews_appointment",
                table: "mentor_reviews");

            migrationBuilder.DropForeignKey(
                name: "fk_mentor_reviews_mentee",
                table: "mentor_reviews");

            migrationBuilder.DropForeignKey(
                name: "fk_mentor_reviews_mentor",
                table: "mentor_reviews");

            migrationBuilder.DropTable(
                name: "mentor_review_upvotes");

            migrationBuilder.DropIndex(
                name: "idx_mentor_reviews_mentor_id",
                table: "mentor_reviews");

            migrationBuilder.DropIndex(
                name: "idx_mentor_reviews_appointment_id",
                table: "mentor_reviews");

            migrationBuilder.DropIndex(
                name: "idx_mentor_reviews_mentee_id",
                table: "mentor_reviews");

            migrationBuilder.DropColumn(
                name: "mentor_id",
                table: "mentor_reviews");

            migrationBuilder.DropColumn(
                name: "appointment_id",
                table: "mentor_reviews");

            migrationBuilder.DropColumn(
                name: "mentee_id",
                table: "mentor_reviews");

            migrationBuilder.AddColumn<Guid>(
                name: "mentor_profile_id",
                table: "mentor_reviews",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "user_id",
                table: "mentor_reviews",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "idx_mentor_reviews_mentor_profile_id",
                table: "mentor_reviews",
                column: "mentor_profile_id");

            migrationBuilder.CreateIndex(
                name: "idx_mentor_reviews_user_id",
                table: "mentor_reviews",
                column: "user_id");

            migrationBuilder.AddForeignKey(
                name: "fk_mentor_reviews_mentor_profile",
                table: "mentor_reviews",
                column: "mentor_profile_id",
                principalTable: "mentor_profiles",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_mentor_reviews_user",
                table: "mentor_reviews",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
