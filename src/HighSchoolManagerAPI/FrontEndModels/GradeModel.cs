using System;
using System.ComponentModel.DataAnnotations;

namespace HighSchoolManagerAPI.FrontEndModels
{
    public class GradeModel
    {
        [Required(AllowEmptyStrings = false)]
        [MaxLength(20)]
        public string Name { get; set; }
    }
}