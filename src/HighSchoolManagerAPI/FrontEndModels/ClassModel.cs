using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HighSchoolManagerAPI.FrontEndModels
{
    public class ClassModel
    {
        [Required(AllowEmptyStrings = false)]
        public string Name { get; set; }

        [Range(1970, int.MaxValue, ErrorMessage = "Year is required")]
        public int Year { get; set; }

        // using [Required], if no value is assigned for GradeID then GradeID = 0 (not null)
        /*  
         *  We can use:
         *  [Required]
         *  public int? GradeID { get; set; }
         */
        [Range(1, int.MaxValue, ErrorMessage = "Grade ID is required")]
        public int GradeID { get; set; }

        public int? HeadTeacherID { get; set; }
    }
}