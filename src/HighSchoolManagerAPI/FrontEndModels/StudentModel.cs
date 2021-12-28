using System;
using System.ComponentModel.DataAnnotations;

namespace HighSchoolManagerAPI.FrontEndModels
{
    public class StudentModel
    {
        [Required(AllowEmptyStrings = false)]
        [MaxLength(256)]
        public string FirstName { get; set; }

        [Required(AllowEmptyStrings = false)]
        [MaxLength(256)]
        public string LastName { get; set; }

        [Required(AllowEmptyStrings = false)]
        [MaxLength(256)]
        public string Gender { get; set; }

        [Required]
        [DataType(DataType.Date)]
        public DateTime Birthday { get; set; }

        [Required(AllowEmptyStrings = false)]
        [MaxLength(256)]
        public string Address { get; set; }

        [Required]
        [DataType(DataType.Date)]
        public DateTime EnrollDate { get; set; }

        public int? ClassID { get; set; }
    }
}