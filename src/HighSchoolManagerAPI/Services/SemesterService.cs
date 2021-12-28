using System.Collections.Generic;
using System.Linq;
using ApplicationCore.Entities;
using ApplicationCore.Interfaces;
using HighSchoolManagerAPI.Services.IServices;

namespace HighSchoolManagerAPI.Services
{
    public class SemesterService : ISemesterService
    {
        private readonly IUnitOfWork _unitOfWork;
        public SemesterService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public Semester GetSemester(int semesterId)
        {
            return _unitOfWork.Semester.GetBy(semesterId);
        }

        public IEnumerable<Semester> GetSemesters(int? label, int? year)
        {
            var semesters = _unitOfWork.Semester.GetAll();

            if (label != null)
            {
                semesters = semesters.Where(s => s.Label == label);
            }

            if (year != null)
            {
                semesters = semesters.Where(s => s.Year == year);
            }

            return semesters;
        }

        public void CreateSemester(Semester semester)
        {
            _unitOfWork.Semester.Add(semester);
            _unitOfWork.Complete();
        }
    }
}