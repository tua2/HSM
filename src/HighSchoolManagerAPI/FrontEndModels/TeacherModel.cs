using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HighSchoolManagerAPI.FrontEndModels
{
    public class TeacherModel
    {
        [Required(AllowEmptyStrings = false)]
        [MaxLength(256)]
        public string Name { get; set; }

        [Required(AllowEmptyStrings = false)]
        [MaxLength(256)]
        public string Gender { get; set; }

        [DataType(DataType.Date)]
        public DateTime Birthday { get; set; }
    }
}