namespace ResumeXCreator.Services;

using ResumeXCreator.Domain.Entities;
using ResumeXCreator.Domain.Interfaces;
using ResumeXCreator.Services.Abstraction;
using ResumeXCreator.Services.DTOs;

public class EducationService(
    IEducationRepository educationRepository,
    IProfileRepository profileRepository) : IEducationService
{
  private readonly IEducationRepository _educationRepository = educationRepository;
  private readonly IProfileRepository _profileRepository = profileRepository;

  public async Task<IEnumerable<EducationDto>> GetEducationsByUserIdAsync(string userId)
  {
    var educations = await _educationRepository.GetByUserIdAsync(userId);
    return educations.Select(e => MapToDto(e, null));
  }

  public async Task<EducationDto?> GetEducationByIdAsync(string userId, Guid id)
  {
    var education = await _educationRepository.GetByIdAsync(id);
    if (education == null || education.UserId != userId) return null;
    return MapToDto(education, null);
  }

  public async Task<EducationDto> CreateEducationAsync(string userId, CreateEducationDto dto)
  {
    var education = new Education
    {
      Id = Guid.NewGuid(),
      UserId = userId,
      SchoolName = dto.SchoolName,
      Degree = dto.Degree,
      FieldOfStudy = dto.FieldOfStudy,
      StartDate = dto.StartDate,
      EndDate = dto.EndDate,
      IsOngoing = dto.IsOngoing,
      GPA = dto.GPA
    };

    await _educationRepository.AddAsync(education);
    await _educationRepository.SaveChangesAsync();

    return MapToDto(education, null);
  }

  public async Task<EducationDto?> UpdateEducationAsync(string userId, Guid id, CreateEducationDto dto)
  {
    var education = await _educationRepository.GetByIdAsync(id);
    if (education == null || education.UserId != userId) return null;

    education.SchoolName = dto.SchoolName;
    education.Degree = dto.Degree;
    education.FieldOfStudy = dto.FieldOfStudy;
    education.StartDate = dto.StartDate;
    education.EndDate = dto.EndDate;
    education.IsOngoing = dto.IsOngoing;
    education.GPA = dto.GPA;

    _educationRepository.Update(education);
    await _educationRepository.SaveChangesAsync();

    return MapToDto(education, null);
  }

  public async Task<bool> DeleteEducationAsync(string userId, Guid id)
  {
    var education = await _educationRepository.GetByIdAsync(id);
    if (education == null || education.UserId != userId) return false;

    _educationRepository.Delete(education);
    await _educationRepository.SaveChangesAsync();
    return true;
  }

  public async Task<IEnumerable<EducationDto>> GetEducationByProfileIdAsync(Guid profileId)
  {
    var profile = await _profileRepository.GetWithDetailsByIdAsync(profileId);
    if (profile == null) return [];

    return profile.ProfileEducations
      .OrderBy(pe => pe.SortOrder)
      .Select(pe => MapToDto(pe.Education ?? new Education(), profileId));
  }

  private static EducationDto MapToDto(Education education, Guid? profileId)
  {
    return new EducationDto
    {
      Id = education.Id,
      ProfileId = profileId,
      SchoolName = education.SchoolName,
      Degree = education.Degree,
      FieldOfStudy = education.FieldOfStudy,
      StartDate = education.StartDate,
      EndDate = education.EndDate,
      IsOngoing = education.IsOngoing,
      GPA = education.GPA
    };
  }
}