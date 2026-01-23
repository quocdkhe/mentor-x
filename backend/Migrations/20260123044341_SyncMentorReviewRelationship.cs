using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class SyncMentorReviewRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Empty migration - the database schema is already correct
            // This migration only serves to sync the EF model snapshot
            // The relationship between MentorReview and MentorProfile was never in the database
            // (it was removed in the 20260123031427_UpdateMentorReviewsSchema migration)
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Empty migration - no changes to revert
        }
    }
}
