using System.Collections.Generic;
using ApplicationCore.Entities;

namespace HighSchoolManagerAPI.Services.IServices
{
    public interface IClassService
    {
        Class GetClass(int classId);
        IEnumerable<Class> GetClasses(int? classId, string name, int? year, int? gradeId, int? headTeacherId, string sort);
        void CreateClass(Class classObj);
        void Update();
        void DeleteClass(Class classObj);

        Grade GetGrade(int gradeId);
        IEnumerable<Grade> GetGrades(string name);
    }
}