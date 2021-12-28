using System.ComponentModel.DataAnnotations;

namespace HighSchoolManagerAPI.FrontEndModels
{
    public class UpdateMarkModel
    {
        [Range(1, int.MaxValue, ErrorMessage = "Student is required")]
        public int StudentID { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Semester is required")]
        public int SemesterID { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Subject is required")]
        public int SubjectID { get; set; }

        [Range(1, 12, ErrorMessage = "Month is required. Must be between 1 and 12")]
        public int Month { get; set; }

        [Range(0, 10, ErrorMessage = "Mark is required. Must be between 0 and 10")]
        public double Mark { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "ResultType is required")]
        public int ResultTypeID { get; set; }
    }
}
