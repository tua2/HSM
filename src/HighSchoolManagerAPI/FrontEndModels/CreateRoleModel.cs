using System.ComponentModel.DataAnnotations;

namespace HighSchoolManagerAPI.FrontEndModels
{
    public class CreateRoleModel
    {
        [Required]
        public string RoleName { get; set; }
    }
}