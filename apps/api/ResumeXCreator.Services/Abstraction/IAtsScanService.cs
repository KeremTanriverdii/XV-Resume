using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ResumeXCreator.Services.DTOs;

namespace ResumeXCreator.Services.Abstraction;

public interface IAtsScanService
{
  Task<AtsScanDto> CreateScanAsync(CreateAtsScanDto dto, string userId);
  Task<IEnumerable<AtsScanDto>> GetUserScansAsync(string userId, int page = 1, int pageSize = 10);
  Task<AtsScanDto?> GetScanByIdAsync(Guid id);
  Task<bool> DeleteScanAsync(Guid id, string userId);
}
