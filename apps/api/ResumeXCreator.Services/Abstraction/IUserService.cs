
using ResumeXCreator.Domain.Entities;
using ResumeXCreator.Services.DTOs;

namespace ResumeXCreator.Services.Abstraction;

public interface IUserService
{
  Task<User?> GetUserAsync(string userId);

  Task<User> UpdateUserAsync(UserUpdateDto userUpdateDto, string userId);
}