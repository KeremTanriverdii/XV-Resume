using Microsoft.EntityFrameworkCore;
using ResumeXCreator.Domain.Entities;

namespace ResumeXCreator.Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{

  public DbSet<User> Users => Set<User>();
  public DbSet<Profile> Profiles => Set<Profile>();
  public DbSet<Resume> Resumes => Set<Resume>();
  public DbSet<ResumeTranslation> ResumeTranslations => Set<ResumeTranslation>();
  public DbSet<Project> Projects => Set<Project>();
  public DbSet<Education> Educations => Set<Education>();
  public DbSet<Experience> Experiences => Set<Experience>();

  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    base.OnModelCreating(modelBuilder);

    // ── User ──
    modelBuilder.Entity<User>(entity =>
    {
      entity.HasKey(e => e.Id);
      entity.Property(e => e.Name).HasMaxLength(100);
      entity.Property(e => e.Email).IsRequired().HasMaxLength(150);
    });

    // ── Profile ──
    modelBuilder.Entity<Profile>(entity =>
    {
      entity.HasKey(e => e.Id);
      entity.Property(e => e.ProfileName).IsRequired().HasMaxLength(100);
      entity.Property(e => e.FullName).IsRequired().HasMaxLength(150);
      entity.Property(e => e.Title).HasMaxLength(200);
      entity.Property(e => e.Summary);
      entity.Property(e => e.Email).HasMaxLength(150);
      entity.Property(e => e.Phone).HasMaxLength(50);
      entity.Property(e => e.ExperienceJson);
      entity.Property(e => e.EducationJson);
      entity.Property(e => e.Skills);       // text[] with Npgsql
      entity.Property(e => e.SocialLinks);  // text[] with Npgsql
      entity.Property(e => e.PhotoUrl).HasMaxLength(500);

      entity.HasOne(d => d.User)
            .WithMany(p => p.Profiles)
            .HasForeignKey(d => d.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    });

    // ── Project ──
    modelBuilder.Entity<Project>(entity =>
    {
      entity.HasKey(e => e.Id);
      entity.Property(e => e.ProjectTitle).IsRequired().HasMaxLength(200);
      entity.HasOne(d => d.Profile)
            .WithMany(p => p.Projects)
            .HasForeignKey(d => d.ProfileId)
            .OnDelete(DeleteBehavior.Cascade);
    });

    // ── Education ──
    modelBuilder.Entity<Education>(entity =>
    {
      entity.HasKey(e => e.Id);
      entity.Property(e => e.SchoolName).IsRequired().HasMaxLength(200);
      entity.HasOne(d => d.Profile)
            .WithMany(p => p.Educations)
            .HasForeignKey(d => d.ProfileId)
            .OnDelete(DeleteBehavior.Cascade);
    });

    // ── Experience ──
    modelBuilder.Entity<Experience>(entity =>
    {
      entity.HasKey(e => e.Id);
      entity.Property(e => e.CompanyName).IsRequired().HasMaxLength(200);
      entity.HasOne(d => d.Profile)
            .WithMany(p => p.Experiences)
            .HasForeignKey(d => d.ProfileId)
            .OnDelete(DeleteBehavior.Cascade);
    });

    // ── Resume (Session / Message) ──
    modelBuilder.Entity<Resume>(entity =>
    {
      entity.HasKey(e => e.Id);
      entity.Property(e => e.JobDescription).IsRequired();

      entity.HasOne(d => d.Profile)
            .WithMany(p => p.Resumes)
            .HasForeignKey(d => d.ProfileId)
            .OnDelete(DeleteBehavior.Cascade);
    });

    // ── ResumeTranslation ──
    modelBuilder.Entity<ResumeTranslation>(entity =>
    {
      entity.HasKey(e => e.Id);
      entity.Property(e => e.LanguageCode).IsRequired().HasMaxLength(10);
      entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
      entity.Property(e => e.Summary).IsRequired();
      entity.Property(e => e.ExperienceHtml).IsRequired();
      entity.Property(e => e.EducationHtml).IsRequired();
      entity.Property(e => e.SkillsHtml).IsRequired();

      entity.HasOne(d => d.Resume)
            .WithMany(p => p.Translations)
            .HasForeignKey(d => d.ResumeId)
            .OnDelete(DeleteBehavior.Cascade);
    });
  }
}
