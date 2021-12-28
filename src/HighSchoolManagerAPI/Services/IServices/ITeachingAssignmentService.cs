using System.Collections.Generic;
using ApplicationCore.Entities;

namespace HighSchoolManagerAPI.Services.IServices
{
    public interface ITeachingAssignmentService
    {
        TeachingAssignment GetTeachingAssignment(int teachingAssignmentId);
        TeachingAssignment GetTeachingAssignment(int teacherId, int classId, int subjectId);
        IEnumerable<TeachingAssignment> GetTeachingAssignments(int? teacherId, int? classId, int? subjectId, string sort);
        void CreateTeachingAssignment(TeachingAssignment teachingAssignment);
        void Update();
        void DeleteTeachingAssignment(TeachingAssignment teachingAssignment);
    }
}