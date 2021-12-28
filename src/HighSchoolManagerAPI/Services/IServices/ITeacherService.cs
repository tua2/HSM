using System.Collections.Generic;
using ApplicationCore.Entities;

namespace HighSchoolManagerAPI.Services.IServices
{
    public interface ITeacherService
    {
        Teacher GetTeacher(int teacherId);
        IEnumerable<Teacher> GetTeachers(string name, string gender, string sort);
        void CreateTeacher(Teacher teacher);
        void Update();
        void DeleteTeacher(Teacher teacher);
    }
}