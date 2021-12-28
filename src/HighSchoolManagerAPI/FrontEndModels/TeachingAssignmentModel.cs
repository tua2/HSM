using System.ComponentModel.DataAnnotations;

namespace HighSchoolManagerAPI.FrontEndModels
{
    public class TeachingAssignmentModel
    {
        [Range(1, int.MaxValue, ErrorMessage = "Teacher is required")]
        public int TeacherID { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Class is required")]
        public int ClassID { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Subject is required")]
        public int SubjectID { get; set; }
    }
}