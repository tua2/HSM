using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ApplicationCore.Entities;
using ApplicationCore.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace Infrastructure.Persistence.Repositories
{
    public class AccountRepository : IAccountRepository
    {
        private readonly UserManager<ApplicationUser> userManager;
        private readonly SignInManager<ApplicationUser> signInManager;
        private readonly RoleManager<IdentityRole> roleManager;

        public AccountRepository(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager, RoleManager<IdentityRole> roleManager)
        {
            this.signInManager = signInManager;
            this.userManager = userManager;
            this.roleManager = roleManager;
        }

        public async Task<SignInResult> LoginAsync(string userName, string password, bool isPersistent, bool lockoutOnFailure)
        {
            var result = await signInManager.PasswordSignInAsync(userName, password, isPersistent, lockoutOnFailure);
            return result;
        }

        public async Task LogoutAsync()
        {
            await signInManager.SignOutAsync();
        }

        public async Task<ApplicationUser> GetUserAsync(string userName)
        {
            return await userManager.FindByNameAsync(userName);
        }

        public async Task<IdentityResult> CreateUserAsync(ApplicationUser user, string password)
        {
            var result = await userManager.CreateAsync(user, password);
            return result;
        }

        public async Task<IdentityResult> AddUserToRoleAsync(ApplicationUser user, string role)
        {
            var result = await userManager.AddToRoleAsync(user, role);
            return result;
        }

        public async Task<IEnumerable<string>> GetUserRolesAsync(string userName)
        {
            ApplicationUser user = await userManager.FindByNameAsync(userName);
            var roles = await userManager.GetRolesAsync(user);
            return roles;
        }

        public async Task<IdentityRole> GetRoleAsync(string name)
        {
            return await roleManager.FindByNameAsync(name);
        }

        public IEnumerable<IdentityRole> GetAllRoles()
        {
            return roleManager.Roles;
        }

        public async Task<IdentityResult> CreateRoleAsync(IdentityRole role)
        {
            return await roleManager.CreateAsync(role);
        }

        public async Task<bool> IsInRoleAsync(ApplicationUser user, string role)
        {
            return await userManager.IsInRoleAsync(user, role);
        }

        public async Task<IdentityResult> RemoveFromRoleAsync(ApplicationUser user, string role)
        {
            return await userManager.RemoveFromRoleAsync(user, role);
        }

        public async Task<IdentityResult> RemoveFromRolesAsync(ApplicationUser user, IEnumerable<string> roles)
        {
            return await userManager.RemoveFromRolesAsync(user, roles);
        }

        public async Task<IdentityResult> UpdateAsync(ApplicationUser user)
        {
            return await userManager.UpdateAsync(user);
        }

        public IQueryable<ApplicationUser> GetAll()
        {
            return userManager.Users;
        }
    }
}