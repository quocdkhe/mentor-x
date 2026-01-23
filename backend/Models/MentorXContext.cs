using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace backend.Models;

public partial class MentorXContext : DbContext
{
    public MentorXContext()
    {
    }

    public MentorXContext(DbContextOptions<MentorXContext> options)
        : base(options)
    {
    }

    public virtual DbSet<RefreshToken> RefreshTokens { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<ForumTopic> ForumTopics { get; set; }

    public virtual DbSet<ForumPost> ForumPosts { get; set; }

    public virtual DbSet<MentorProfile> MentorProfiles { get; set; }

    public virtual DbSet<Skill> Skills { get; set; }

    public virtual DbSet<MentorReview> MentorReviews { get; set; }

    public virtual DbSet<Availability> Availabilities { get; set; }

    public virtual DbSet<Appointment> Appointments { get; set; }

    public virtual DbSet<GoogleAccount> GoogleAccounts { get; set; }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("refresh_tokens_pkey");

            entity.ToTable("refresh_tokens");

            entity.HasIndex(e => e.Token, "idx_refresh_tokens_token");

            entity.HasIndex(e => e.UserId, "idx_refresh_tokens_user_id");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            entity.Property(e => e.ExpiresAt).HasColumnName("expires_at");
            entity.Property(e => e.Token).HasColumnName("token");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.RefreshTokens)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("fk_user");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("users_pkey");

            entity.ToTable("users");

            entity.HasIndex(e => e.Email, "users_email_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.Avatar).HasColumnName("avatar");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            entity.Property(e => e.Email).HasColumnName("email");
            entity.Property(e => e.Name).HasColumnName("name");
            entity.Property(e => e.Password).HasColumnName("password");
            entity.Property(e => e.Phone).HasColumnName("phone");
            entity.Property(e => e.Role)
                .HasConversion<string>()
                .HasDefaultValue(UserRole.User)
                .HasColumnName("role");

            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("updated_at");
        });

        modelBuilder.Entity<Skill>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("skills_pkey");
            entity.ToTable("skills");
            entity.HasIndex(e => e.Name, "skills_name_key").IsUnique();

            entity.Property(e => e.Id)
            .HasDefaultValueSql("gen_random_uuid()")
            .HasColumnName("id");

            entity.Property(e => e.Name)
            .HasColumnName("name");
            entity.Property(e => e.Icon)
            .HasColumnName("icon");
        });



        modelBuilder.Entity<MentorProfile>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("mentor_profiles_pkey");
            entity.ToTable("mentor_profiles");
            entity.HasIndex(e => e.UserId, "mentor_profiles_user_id_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");

            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.Biography).HasColumnName("biography");
            entity.Property(e => e.PricePerHour).HasColumnName("price_per_hour");
            entity.Property(e => e.AvgRating).HasDefaultValue(0d).HasColumnName("avg_rating");
            entity.Property(e => e.TotalRatings).HasDefaultValue(0).HasColumnName("total_ratings");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()").HasColumnName("created_at");

            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("updated_at");

            entity.Property(e => e.Position)
              .HasColumnName("position");

            entity.Property(e => e.Company)
                  .HasColumnName("company");

            entity.Property(e => e.YearsOfExperience)
                  .HasColumnName("years_of_experience");

            // nếu có status
            entity.Property(e => e.Status)
                  .HasColumnName("status");

            entity.HasOne(d => d.User)
                .WithOne(p => p.MentorProfile)
                .HasForeignKey<MentorProfile>(d => d.UserId)
                .HasConstraintName("fk_mentor_profiles_user");
        });

        modelBuilder.Entity<MentorReview>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("mentor_reviews_pkey");
            entity.ToTable("mentor_reviews");

            entity.HasIndex(e => e.MentorId, "idx_mentor_reviews_mentor_id");
            entity.HasIndex(e => e.MenteeId, "idx_mentor_reviews_mentee_id");
            entity.HasIndex(e => e.AppointmentId, "idx_mentor_reviews_appointment_id");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");

            entity.Property(e => e.MentorId).HasColumnName("mentor_id");
            entity.Property(e => e.MenteeId).HasColumnName("mentee_id");
            entity.Property(e => e.AppointmentId).HasColumnName("appointment_id");
            entity.Property(e => e.Rating).HasColumnName("rating");
            entity.Property(e => e.Comment).HasColumnName("comment");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");

            // Foreign key: Mentor
            entity.HasOne(d => d.Mentor)
                .WithMany(p => p.MentorReviews)
                .HasForeignKey(d => d.MentorId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_mentor_reviews_mentor");

            // Foreign key: Mentee
            entity.HasOne(d => d.Mentee)
                .WithMany(p => p.MenteeReviews)
                .HasForeignKey(d => d.MenteeId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_mentor_reviews_mentee");

            // Foreign key: Appointment
            entity.HasOne(d => d.Appointment)
                .WithMany(p => p.Reviews)
                .HasForeignKey(d => d.AppointmentId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_mentor_reviews_appointment");

            // Many-to-Many: Upvoters
            entity.HasMany(r => r.Upvoters)
                .WithMany(u => u.UpvotedReviews)
                .UsingEntity<Dictionary<string, object>>(
                    "mentor_review_upvotes",
                    j => j
                        .HasOne<User>()
                        .WithMany()
                        .HasForeignKey("user_id")
                        .HasConstraintName("fk_mentor_review_upvotes_user")
                        .OnDelete(DeleteBehavior.Cascade),
                    j => j
                        .HasOne<MentorReview>()
                        .WithMany()
                        .HasForeignKey("mentor_review_id")
                        .HasConstraintName("fk_mentor_review_upvotes_review")
                        .OnDelete(DeleteBehavior.Cascade),
                    j =>
                    {
                        j.HasKey("mentor_review_id", "user_id");
                        j.ToTable("mentor_review_upvotes");
                    }
                );
        });

        // pivot table mentor_skill (no entity)
        modelBuilder.Entity<MentorProfile>()
            .HasMany(d => d.MentorSkills)
            .WithMany(p => p.MentorProfiles)
            .UsingEntity<Dictionary<string, object>>(
                "MentorSkill",
                r => r.HasOne<Skill>().WithMany()
                    .HasForeignKey("SkillId")
                    .HasConstraintName("fk_mentor_skill_skill")
                    .OnDelete(DeleteBehavior.Cascade),
                l => l.HasOne<MentorProfile>().WithMany()
                    .HasForeignKey("MentorProfileId")
                    .HasConstraintName("fk_mentor_skill_mentor_profile")
                    .OnDelete(DeleteBehavior.Cascade),
                j =>
                {
                    j.HasKey("MentorProfileId", "SkillId").HasName("mentor_skill_pkey");
                    j.ToTable("mentor_skill");
                    j.IndexerProperty<Guid>("MentorProfileId").HasColumnName("mentor_profile_id");
                    j.IndexerProperty<Guid>("SkillId").HasColumnName("skill_id");
                    j.HasIndex(new[] { "SkillId" }, "idx_mentor_skill_skill_id");
                });


        modelBuilder.Entity<ForumTopic>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("forum_topics_pkey");

            entity.ToTable("forum_topics");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");

            entity.Property(e => e.Type)
                .HasConversion<string>()
                .HasColumnName("type");

            entity.Property(e => e.Topic)
                .HasColumnName("topic");

            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany()
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("fk_forum_topic_created_by");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");

            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("updated_at");
        });

        modelBuilder.Entity<ForumPost>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("forum_posts_pkey");

            entity.ToTable("forum_posts");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");

            entity.Property(e => e.Content)
                .HasColumnName("content");

            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.HasOne(d => d.User).WithMany()
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("fk_forum_post_created_by");

            entity.Property(e => e.ForumTopicId).HasColumnName("forum_topic_id");
            entity.HasOne(d => d.ForumTopic).WithMany(p => p.ForumPosts)
                .HasForeignKey(d => d.ForumTopicId)
                .HasConstraintName("fk_forum_topic_id");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");

            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("updated_at");

            entity.HasMany(p => p.Likers)
                .WithMany()
                .UsingEntity<Dictionary<string, object>>(
                    "forum_post_likes",
                    j => j
                        .HasOne<User>()
                        .WithMany()
                        .HasForeignKey("user_id")
                        .HasConstraintName("fk_forum_post_likes_user")
                        .OnDelete(DeleteBehavior.Cascade),
                    j => j
                        .HasOne<ForumPost>()
                        .WithMany()
                        .HasForeignKey("forum_post_id")
                        .HasConstraintName("fk_forum_post_likes_post")
                        .OnDelete(DeleteBehavior.Cascade),
                    j =>
                    {
                        j.HasKey("forum_post_id", "user_id");
                        j.ToTable("forum_post_likes");
                    }
                );
        });

        modelBuilder.Entity<Availability>(entity =>
        {
            entity.HasKey(e => e.Id)
                .HasName("availabilities_pkey");

            entity.ToTable("availabilities");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");

            entity.Property(e => e.MentorId)
                .HasColumnName("mentor_id");

            entity.Property(e => e.DayOfWeek)
                .HasColumnName("day_of_week");

            entity.Property(e => e.StartTime)
                .HasColumnType("time")
                .HasColumnName("start_time");

            entity.Property(e => e.EndTime)
                .HasColumnType("time")
                .HasColumnName("end_time");

            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");

            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("updated_at");

            entity.HasOne(e => e.Mentor)
                .WithMany()
                .HasForeignKey(e => e.MentorId)
                .HasConstraintName("fk_availabilities_mentor");
        });

        modelBuilder.Entity<Appointment>(entity =>
        {
            entity.HasKey(e => e.Id)
                .HasName("appointments_pkey");

            entity.ToTable("appointments");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");

            entity.Property(e => e.MentorId)
                .HasColumnName("mentor_id");

            entity.Property(e => e.MenteeId)
                .HasColumnName("mentee_id");

            entity.Property(e => e.StartAt)
                .HasColumnType("timestamp with time zone")
                .HasColumnName("start_at");

            entity.Property(e => e.EndAt)
                .HasColumnType("timestamp with time zone")
                .HasColumnName("end_at");

            entity.Property(e => e.Status)
                .HasConversion<string>()
                .HasDefaultValue(AppointmentStatusEnum.Pending)
                .HasColumnName("status");

            entity.Property(e => e.MeetingLink)
                .HasColumnName("meeting_link");
            
            entity.Property(e=> e.GoogleCalendarLink)
                .HasColumnName("google_calendar_link");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");

            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("updated_at");

            entity.HasOne(e => e.Mentor)
                .WithMany()
                .HasForeignKey(e => e.MentorId)
                .HasConstraintName("fk_appointments_mentor")
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Mentee)
                .WithMany()
                .HasForeignKey(e => e.MenteeId)
                .HasConstraintName("fk_appointments_mentee")
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<GoogleAccount>(entity =>
        {
            entity.ToTable("google_accounts");

            entity.HasKey(e => e.UserId)
                .HasName("google_accounts_pkey");

            entity.Property(e => e.UserId)
                .HasColumnName("user_id");

            entity.Property(e => e.GoogleUserId)
                .HasColumnName("google_user_id");

            entity.Property(e => e.RefreshToken)
                .HasColumnName("refresh_token");

            entity.Property(e => e.Scope)
                .HasColumnName("scope");

            entity.Property(e => e.TokenType)
                .HasColumnName("token_type");

            entity.Property(e => e.RefreshTokenRevoked)
                .HasColumnName("refresh_token_revoked");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");

            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("updated_at");

            entity.HasOne(d => d.User)
                .WithOne()
                .HasForeignKey<GoogleAccount>(d => d.UserId)
                .HasConstraintName("fk_google_accounts_user");
        });



        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
