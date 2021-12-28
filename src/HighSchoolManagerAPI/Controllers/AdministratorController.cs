using Microsoft.AspNetCore.Mvc;
using HighSchoolManagerAPI.Helpers;
using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;
using HighSchoolManagerAPI.Services.IServices;
using System.Threading.Tasks;
using HighSchoolManagerAPI.FrontEndModels;

namespace HighSchoolManagerAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    // [Authorize(Roles = "Admin")]
    public class AdministratorController : ControllerBase
    {
        private readonly IAccountService _accountService;
        private ResponseHelper resp;
        public AdministratorController(IAccountService accountService)
        {
            _accountService = accountService;
            resp = new ResponseHelper();
        }

        // Get all roles
        [HttpGet("GetRoles")]
        public ActionResult<IEnumerable<IdentityRole>> GetRoles()
        {
            var roles = _accountService.GetRoles();
            return Ok(roles);
        }

        [HttpPost("CreateRole")]
        public async Task<ActionResult> CreateRole(CreateRoleModel model)
        {
            if (ModelState.IsValid)
            {
                IdentityRole identityRole = new IdentityRole
                {
                    Name = model.RoleName
                };

                IdentityResult result = await _accountService.CreateRoleAsync(identityRole);

                if (result.Succeeded)
                {
                    return StatusCode(200); // 200: Ok
                }
                else
                {
                    var errors = result.Errors;
                    return BadRequest(errors); // 400: BadRequest
                }
            }
            else
            {
                var errors = new List<string>();
                foreach (var state in ModelState)
                {
                    foreach (var error in state.Value.Errors)
                    {
                        errors.Add(error.ErrorMessage);
                    }
                }
                return BadRequest(errors); // 400: BadRequest
            }
        }

        // User - Role: One - One Relationship
        // PUT: api/Administrator/ChangeUserRole?userName=abc&role=xyz
        [HttpPut("ChangeUserRole")]
        public async Task<ActionResult> ChangeUserRole(string userName, string role)
        {
            var user = await _accountService.GetUserAsync(userName);
            // if user exist
            if (user == null)
            {
                resp.code = 404;
                resp.messages.Add("User " + userName + " not found");
                return NotFound(resp);
            }

            var identityRole = await _accountService.GetRoleAsync(role);
            // if role exist
            if (identityRole == null)
            {
                resp.code = 404;
                resp.messages.Add("Role " + role + " not found");
                return NotFound(resp);
            }

            // Get user current role(s)
            var currentUserRoles = await _accountService.GetUserRolesAsync(user.UserName);

            // Remove user from current role(s)
            await _accountService.RemoveFromRolesAsync(user, currentUserRoles);

            // Add user to new role
            await _accountService.AddUserToRoleAsync(user, role);

            return Ok();
        }

        [HttpPut("ChangeUserPassword")]
        public async Task<ActionResult> ChangePassword(LoginModel model)
        {
            var user = await _accountService.GetUserAsync(model.UserName);
            // if user exist
            if (user == null)
            {
                resp.code = 404;
                resp.messages.Add("User " + model.UserName + " not found");
                return NotFound(resp);
            }

            await _accountService.ChangePasswordAsync(user, model.Password);

            return Ok();
        }
    }
}
