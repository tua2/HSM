using System.Collections.Generic;
using System.Threading.Tasks;
using ApplicationCore.Entities;
using Microsoft.AspNetCore.Identity;

namespace HighSchoolManagerAPI.Services.IServices
{
    public interface IAccountService
    {
        Task<Microsoft.AspNetCore.Identity.SignInResult> LoginAsync(string userName, string password, bool isPersistent, bool lockoutOnFailure);
        Task LogoutAsync();
        Task<ApplicationUser> GetUserAsync(string userName);
        Task<IdentityResult> CreateUserAsync(ApplicationUser user, string password);
        Task<IdentityResult> AddUserToRoleAsync(ApplicationUser user, string role);
        Task<IEnumerable<string>> GetUserRolesAsync(string userName);
        Task<IdentityRole> GetRoleAsync(string name);
        IEnumerable<IdentityRole> GetRoles();
        Task<IdentityResult> CreateRoleAsync(IdentityRole role);
        Task<bool> IsInRoleAsync(ApplicationUser user, string role);
        Task<IdentityResult> RemoveFromRoleAsync(ApplicationUser user, string role);
        Task<IdentityResult> RemoveFromRolesAsync(ApplicationUser user, IEnumerable<string> roles);
        Task<IdentityResult> ChangePasswordAsync(ApplicationUser user, string newPassword);
        IEnumerable<ApplicationUser> GetUsers();
        // public IEnumerable<string> GetUserRoles(string UserName);
        // public string GetUserName(int? teacherId);
    }
}