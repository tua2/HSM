using System.Collections.Generic;
using System.Linq;
using ApplicationCore.Entities;
using ApplicationCore.Interfaces;
using HighSchoolManagerAPI.Services.IServices;

namespace HighSchoolManagerAPI.Services
{
    public class TeacherService : ITeacherService
    {
        private readonly IUnitOfWork _unitOfWork;

        public TeacherService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public Teacher GetTeacher(int teacherId)
        {
            return _unitOfWork.Teacher.GetBy(teacherId);
        }

        public IEnumerable<Teacher> GetTeachers(string name, string gender, string sort)
        {
            var teachers = _unitOfWork.Teacher.GetAll();
            // filter by name
            if (!string.IsNullOrEmpty(name))
            {
                teachers = teachers.Where(t => t.Name.Contains(name));
            }

            // filter by gender
            if (!string.IsNullOrEmpty(gender))
            {
                teachers = teachers.Where(t => t.Gender.Equals(gender));
            }

            // order by teacherId (default)
            teachers = teachers.OrderBy(t => t.TeacherID);

            // order by others
            if (!string.IsNullOrEmpty(sort))
            {
                switch (sort)
                {
                    case "name":
                        teachers = teachers.OrderBy(t => t.Name);
                        break;
                    case "name-desc":
                        teachers = teachers.OrderByDescending(t => t.Name);
                        break;
                    case "gender":
                        teachers = teachers.OrderBy(s => s.Gender);
                        break;
                    case "gender-desc":
                        teachers = teachers.OrderByDescending(s => s.Gender);
                        break;
                    default:
                        break;
                }
            }

            return teachers;
        }

        public void CreateTeacher(Teacher teacher)
        {
            _unitOfWork.Teacher.Add(teacher);
            _unitOfWork.Complete();
        }

        public void Update()
        {
            _unitOfWork.Complete();
        }

        public void DeleteTeacher(Teacher teacher)
        {
            _unitOfWork.Teacher.Remove(teacher);
            _unitOfWork.Complete();
        }
    }
}
