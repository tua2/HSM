namespace HighSchoolManagerAPI.Helpers
{
    public interface IExistHelper
    {
        bool StudentExists(int? id);
        bool TeacherExists(int? id);
        bool GradeExists(int? id);
        bool ClassExists(int id);
        bool ClassExists(string name, int year);
        bool HeadTeacherExists(int id);
        bool SemesterExists(int id);
        bool SemesterExists(int label, int year);
        bool SubjectExists(int id);
        bool ResultTypeExists(int id);
        bool TeachingAssignmentExist(int teacherId, int classId, int subjectId);
    }
}