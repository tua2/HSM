using System.Collections.Generic;
using System.Linq;
using ApplicationCore.Entities;
using ApplicationCore.Interfaces;
using HighSchoolManagerAPI.Services.IServices;

namespace HighSchoolManagerAPI.Services
{
    public class SubjectService : ISubjectService
    {
        private readonly IUnitOfWork _unitOfWork;

        public SubjectService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public Subject GetSubject(int subjectId)
        {
            return _unitOfWork.Subject.GetBy(subjectId);
        }

        public IEnumerable<Subject> GetSubjects(string name, string sort)
        {
            var subjects = _unitOfWork.Subject.GetAll();
            // filter by name
            if (!string.IsNullOrEmpty(name))
            {
                subjects = subjects.Where(s => s.Name.Contains(name));
            }

            // order by subjectId (default)
            subjects = subjects.OrderBy(s => s.SubjectID);

            // order by others
            if (!string.IsNullOrEmpty(sort))
            {
                switch (sort)
                {
                    case "name":
                        subjects = subjects.OrderBy(s => s.Name);
                        break;
                    case "name-desc":
                        subjects = subjects.OrderByDescending(s => s.Name);
                        break;
                    default:
                        break;
                }
            }

            return subjects;
        }

        public void CreateSubject(Subject subject)
        {
            _unitOfWork.Subject.Add(subject);
            _unitOfWork.Complete();
        }

        public void Update()
        {
            _unitOfWork.Complete();
        }

        public void DeleteSubject(Subject subject)
        {
            _unitOfWork.Subject.Remove(subject);
            _unitOfWork.Complete();
        }
    }
}
