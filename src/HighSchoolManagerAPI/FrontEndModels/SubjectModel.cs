using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HighSchoolManagerAPI.FrontEndModels
{
    public class SubjectModel
    {
        [Required(AllowEmptyStrings = false)]
        public string Name { get; set; }
    }
}