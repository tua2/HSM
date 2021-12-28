using System.Collections.Generic;
using ApplicationCore.Entities;

namespace HighSchoolManagerAPI.Services.IServices
{
    public interface ISubjectService
    {
        Subject GetSubject(int subjectId);
        IEnumerable<Subject> GetSubjects(string name, string sort);
        void CreateSubject(Subject subject);
        void Update();
        void DeleteSubject(Subject subject);
    }
}