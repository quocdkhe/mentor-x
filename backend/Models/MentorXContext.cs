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

    entity.Property(e => e.Name).HasColumnName("name");
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

    entity.Property(e => e.CreatedAt)
        .HasDefaultValueSql("now()")
        .HasColumnName("created_at");

    entity.Property(e => e.UpdatedAt)
        .HasDefaultValueSql("now()")
        .HasColumnName("updated_at");

    entity.HasOne(d => d.User)
        .WithOne(p => p.MentorProfile)
        .HasForeignKey<MentorProfile>(d => d.UserId)
        .HasConstraintName("fk_mentor_profiles_user");
});

modelBuilder.Entity<MentorReview>(entity =>
{
    entity.HasKey(e => e.Id).HasName("mentor_reviews_pkey");
    entity.ToTable("mentor_reviews");

    entity.HasIndex(e => e.MentorProfileId, "idx_mentor_reviews_mentor_profile_id");
    entity.HasIndex(e => e.UserId, "idx_mentor_reviews_user_id");

    entity.Property(e => e.Id)
        .HasDefaultValueSql("gen_random_uuid()")
        .HasColumnName("id");

    entity.Property(e => e.MentorProfileId).HasColumnName("mentor_profile_id");
    entity.Property(e => e.UserId).HasColumnName("user_id");
    entity.Property(e => e.Rating).HasColumnName("rating");
    entity.Property(e => e.Comment).HasColumnName("comment");

    entity.Property(e => e.CreatedAt)
        .HasDefaultValueSql("now()")
        .HasColumnName("created_at");

    entity.HasOne(d => d.MentorProfile)
        .WithMany(p => p.MentorReviews)
        .HasForeignKey(d => d.MentorProfileId)
        .HasConstraintName("fk_mentor_reviews_mentor_profile");

    entity.HasOne(d => d.User)
        .WithMany(p => p.MentorReviews)
        .HasForeignKey(d => d.UserId)
        .OnDelete(DeleteBehavior.Restrict)
        .HasConstraintName("fk_mentor_reviews_user");
});

// pivot table mentor_skill (no entity)
modelBuilder.Entity<MentorProfile>()
    .HasMany(d => d.Skills)
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


        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
