using System.Collections.Generic;
using ApplicationCore.Entities;

namespace HighSchoolManagerAPI.Services.IServices
{
    public interface IStudentService
    {
        Student GetStudent(int studentId);
        IEnumerable<Student> GetStudents(string name, int? gradeId, int? classId, int? year, string sort);
        void CreateStudent(Student student);
        void Update();
        void DeleteStudent(Student student);
    }
}