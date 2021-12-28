using System.Linq;
using ApplicationCore.Interfaces;

namespace HighSchoolManagerAPI.Helpers
{
    // CHECK IF ENTITY EXISTS
    public class ExistHelper : IExistHelper
    {
        private readonly IUnitOfWork _unitOfWork;

        public ExistHelper(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public bool StudentExists(int? id)
        {
            id = id.HasValue ? id.Value : 0;
            return (_unitOfWork.Student.GetBy((int)id) != null);
        }

        public bool TeacherExists(int? id)
        {
            id = id.HasValue ? id.Value : 0;
            return (_unitOfWork.Teacher.GetBy((int)id) != null);
        }

        public bool GradeExists(int? id)
        {
            id = id.HasValue ? id.Value : 0;
            return (_unitOfWork.Class.GetGrade((int)id) != null);
        }

        public bool ClassExists(int id)
        {
            return (_unitOfWork.Class.GetBy(id) != null);
        }

        // Check for unique index (Name, Year)
        public bool ClassExists(string name, int year)
        {
            var aClass = _unitOfWork.Class.GetByNameAndYear(name, year);

            return (aClass != null);
        }

        // Check if Head Teacher is not belong to another class
        public bool HeadTeacherExists(int id)
        {
            var aClass = _unitOfWork.Class.GetByHeadTeacher(id);

            return (aClass != null);
        }

        public bool SemesterExists(int id)
        {
            return (_unitOfWork.Semester.GetBy(id) != null);
        }

        public bool SemesterExists(int label, int year)
        {
            return _unitOfWork.Semester.GetAll().Where(s => s.Label == label && s.Year == year).Any();
        }

        public bool SubjectExists(int id)
        {
            return (_unitOfWork.Subject.GetBy(id) != null);
        }

        public bool ResultTypeExists(int id)
        {
            return (_unitOfWork.Result.GetResultType(id) != null);
        }

        public bool TeachingAssignmentExist(int teacherId, int classId, int subjectId)
        {
            var assign = _unitOfWork.TeachingAssignment.GetAll();
            assign = assign.Where(t => t.TeacherID == teacherId)
                        .Where(t => t.ClassID == classId)
                        .Where(t => t.SubjectID == subjectId);
            return (assign.FirstOrDefault() != null);
        }
    }
}
