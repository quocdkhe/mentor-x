using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class InitForumSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "forum_topics",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    topic = table.Column<string>(type: "text", nullable: false),
                    type = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("forum_topics_pkey", x => x.id);
                    table.ForeignKey(
                        name: "fk_forum_topic_created_by",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "forum_posts",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    content = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    forum_topic_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("forum_posts_pkey", x => x.id);
                    table.ForeignKey(
                        name: "fk_forum_post_created_by",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_forum_topic_id",
                        column: x => x.forum_topic_id,
                        principalTable: "forum_topics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "forum_post_likes",
                columns: table => new
                {
                    forum_post_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_forum_post_likes", x => new { x.forum_post_id, x.user_id });
                    table.ForeignKey(
                        name: "fk_forum_post_likes_post",
                        column: x => x.forum_post_id,
                        principalTable: "forum_posts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_forum_post_likes_user",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_forum_post_likes_user_id",
                table: "forum_post_likes",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_forum_posts_forum_topic_id",
                table: "forum_posts",
                column: "forum_topic_id");

            migrationBuilder.CreateIndex(
                name: "IX_forum_posts_user_id",
                table: "forum_posts",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_forum_topics_user_id",
                table: "forum_topics",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "forum_post_likes");

            migrationBuilder.DropTable(
                name: "forum_posts");

            migrationBuilder.DropTable(
                name: "forum_topics");
        }
    }
}
