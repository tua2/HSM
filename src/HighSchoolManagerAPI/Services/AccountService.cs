using System.Collections.Generic;
using System.Threading.Tasks;
using ApplicationCore.Entities;
using ApplicationCore.Interfaces;
using Microsoft.AspNetCore.Identity;
using HighSchoolManagerAPI.Services.IServices;
using System.Linq;

namespace HighSchoolManagerAPI.Services
{
    public class AccountService : IAccountService
    {
        private readonly IUnitOfWork _unitOfWork;

        public AccountService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<SignInResult> LoginAsync(string userName, string password, bool isPersistent, bool lockoutOnFailure)
        {
            var result = await _unitOfWork.Account.LoginAsync(userName, password, isPersistent: false, false);
            return result;
        }

        public async Task LogoutAsync()
        {
            await _unitOfWork.Account.LogoutAsync();
        }

        public async Task<ApplicationUser> GetUserAsync(string userName)
        {
            return await _unitOfWork.Account.GetUserAsync(userName);
        }

        public async Task<IdentityResult> CreateUserAsync(ApplicationUser user, string password)
        {
            var result = await _unitOfWork.Account.CreateUserAsync(user, password);
            return result;
        }

        public async Task<IdentityResult> AddUserToRoleAsync(ApplicationUser user, string role)
        {
            var result = await _unitOfWork.Account.AddUserToRoleAsync(user, role);
            return result;
        }

        public async Task<IEnumerable<string>> GetUserRolesAsync(string userName)
        {
            return await _unitOfWork.Account.GetUserRolesAsync(userName);
        }

        public async Task<IdentityRole> GetRoleAsync(string name)
        {
            return await _unitOfWork.Account.GetRoleAsync(name);
        }

        public IEnumerable<IdentityRole> GetRoles()
        {
            var roles = _unitOfWork.Account.GetAllRoles();

            return roles;
        }

        public async Task<IdentityResult> CreateRoleAsync(IdentityRole role)
        {
            return await _unitOfWork.Account.CreateRoleAsync(role);
        }

        public async Task<bool> IsInRoleAsync(ApplicationUser user, string role)
        {
            return await _unitOfWork.Account.IsInRoleAsync(user, role);
        }

        public async Task<IdentityResult> RemoveFromRoleAsync(ApplicationUser user, string role)
        {
            return await _unitOfWork.Account.RemoveFromRoleAsync(user, role);
        }

        public async Task<IdentityResult> RemoveFromRolesAsync(ApplicationUser user, IEnumerable<string> roles)
        {
            return await _unitOfWork.Account.RemoveFromRolesAsync(user, roles);
        }

        public async Task<IdentityResult> ChangePasswordAsync(ApplicationUser user, string newPassword)
        {
            var hasher = new PasswordHasher<ApplicationUser>();
            string newPasswordHash = hasher.HashPassword(user, newPassword);
            user.PasswordHash = newPasswordHash;

            return await _unitOfWork.Account.UpdateAsync(user);
        }

        public IEnumerable<ApplicationUser> GetUsers()
        {
            return _unitOfWork.Account.GetAll();
        }
    }
}