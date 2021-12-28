using System.ComponentModel.DataAnnotations;

namespace HighSchoolManagerAPI.FrontEndModels
{
    public class RegisterModel
    {
        [Required]
        public string UserName { get; set; }
        [Required]
        [DataType(DataType.Password)]
        public string Password { get; set; }
        [Range(1, int.MaxValue, ErrorMessage = "Teacher ID is required")]
        public int TeacherID { get; set; }
    }
}