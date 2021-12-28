using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using ApplicationCore.Entities;
using ApplicationCore.Interfaces;
using Microsoft.EntityFrameworkCore;
using HighSchoolManagerAPI.Services.IServices;

namespace HighSchoolManagerAPI.Services
{
    public class StudentService : IStudentService
    {
        private readonly IUnitOfWork _unitOfWork;

        public StudentService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public Student GetStudent(int studentId)
        {
            return _unitOfWork.Student.GetBy(studentId);
        }

        public IEnumerable<Student> GetStudents(string name, int? gradeId, int? classId, int? year, string sort)
        {
            var students = _unitOfWork.Student.GetAll().Include(s => s.Class).AsQueryable();
            // filter by name
            if (!String.IsNullOrEmpty(name))
            {
                //replace multiple spaces with single space
                name = name.Trim();
                name = Regex.Replace(name, @"\s+", " ");

                // split into array, ex: input = "abc  xyz" -> output = ["abc", "xyz"]
                List<string> namesArr = name.Split(' ').ToList();

                var newStudents = students.Where(s => s.FirstName.Contains(namesArr[0]) || s.LastName.Contains(namesArr[0]));

                for (int i = 1; i < namesArr.Count; i++)
                {
                    string newName = namesArr[i];
                    var newStudents2 = students.Where(s => s.FirstName.Contains(newName) || s.LastName.Contains(newName));
                    newStudents = newStudents.Union(newStudents2);
                }

                students = newStudents;
            }
            // filter by gradeId
            if (gradeId != null)
            {
                students = students.Where(s => s.Class.GradeID == gradeId);
            }
            // filter by classId
            if (classId != null)
            {
                if (classId == 0)
                {
                    students = students.Where(s => s.ClassID == null);
                }
                else
                {
                    students = students.Where(s => s.ClassID == classId);
                }
            }
            // filter by year (Class.year)
            if (year != null)
            {
                students = students.Where(s => s.Class.Year == year);
            }

            // order by studentId (default)
            students = students.OrderBy(s => s.StudentID);
            // order by others
            if (!String.IsNullOrEmpty(sort))
            {
                switch (sort)
                {
                    case "firstname":
                        students = students.OrderBy(s => s.FirstName);
                        break;
                    case "firstname-desc":
                        students = students.OrderByDescending(s => s.FirstName);
                        break;
                    case "lastname":
                        students = students.OrderBy(s => s.LastName);
                        break;
                    case "lastname-desc":
                        students = students.OrderByDescending(s => s.LastName);
                        break;
                    case "gender":
                        students = students.OrderBy(s => s.Gender);
                        break;
                    case "gender-desc":
                        students = students.OrderByDescending(s => s.Gender);
                        break;
                    case "class":
                        students = students.OrderBy(s => s.ClassID);
                        break;
                    case "class-desc":
                        students = students.OrderByDescending(s => s.ClassID);
                        break;
                    case "grade":
                        students = students.OrderBy(s => s.Class.GradeID);
                        break;
                    case "grade-desc":
                        students = students.OrderByDescending(s => s.Class.GradeID);
                        break;
                    case "year":
                        students = students.OrderBy(s => s.Class.Year);
                        break;
                    case "year-desc":
                        students = students.OrderByDescending(s => s.Class.Year);
                        break;
                    default:
                        break;
                }
            }

            return students;
        }

        public void CreateStudent(Student student)
        {
            _unitOfWork.Student.Add(student);
            _unitOfWork.Complete();
        }

        public void Update()
        {
            _unitOfWork.Complete();
        }

        public void DeleteStudent(Student student)
        {
            _unitOfWork.Student.Remove(student);
            _unitOfWork.Complete();
        }
    }
}
