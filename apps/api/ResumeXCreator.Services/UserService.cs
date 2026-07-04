
using ResumeXCreator.Domain.Entities;
using ResumeXCreator.Domain.Interfaces;
using ResumeXCreator.Services.Abstraction;
using ResumeXCreator.Services.DTOs;

namespace ResumeXCreator.Services;

public class UserService(IUserRepository userRepository) : IUserService
{

  private readonly IUserRepository _userRepository = userRepository;
  public async Task<User?> GetUserAsync(string userId)
  {
    return await _userRepository.GetByIdAsync(userId);
  }
  public async Task<User> UpdateUserAsync(UserUpdateDto userUpdateDto, string UserId)
  {
    var existingUser = await _userRepository.GetByIdAsync(UserId);
    if (existingUser == null)
    {
      throw new Exception("User not found");
    }

    existingUser.ChoosedLanguage = userUpdateDto.ChoosedLanguage;
    existingUser.Name = userUpdateDto.Fullname;
    existingUser.Phone = userUpdateDto.Phone;
    existingUser.DistrictAndCityLocation = userUpdateDto.DistrictAndCityLocation;
    existingUser.PostponedTitle = userUpdateDto.PostponedTitle;
    _userRepository.Update(existingUser);
    await _userRepository.SaveChangesAsync();
    return existingUser;
  }
}