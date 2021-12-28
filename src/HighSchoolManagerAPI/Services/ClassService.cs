using System;
using System.Collections.Generic;
using System.Linq;
using ApplicationCore.Entities;
using ApplicationCore.Interfaces;
using Microsoft.EntityFrameworkCore;
using HighSchoolManagerAPI.Services.IServices;

namespace HighSchoolManagerAPI.Services
{
    public class ClassService : IClassService
    {
        private readonly IUnitOfWork _unitOfWork;

        public ClassService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public Class GetClass(int classId)
        {
            return _unitOfWork.Class.GetBy(classId);
        }

        public IEnumerable<Class> GetClasses(int? classId, string name, int? year, int? gradeId, int? headTeacherId, string sort)
        {
            var classes = _unitOfWork.Class.GetAll().Include(c => c.Grade).Include(c => c.HeadTeacher).AsQueryable();

            // filter by name
            if (!String.IsNullOrEmpty(name))
            {
                classes = classes.Where(c => c.Name.Contains(name));
            }

            // filter by year
            if (year != null)
            {
                classes = classes.Where(c => c.Year == year);
            }

            // filter by gradeId
            if (gradeId != null)
            {
                classes = classes.Where(c => c.GradeID == gradeId);
            }

            // filter by headTeacherId
            if (headTeacherId != null)
            {
                classes = classes.Where(c => c.HeadTeacherID == headTeacherId);
            }

            classes = classes.OrderBy(c => c.ClassID);

            if (!String.IsNullOrEmpty(sort))
            {
                switch (sort)
                {
                    case "name":
                        classes = classes.OrderBy(c => c.Name);
                        break;
                    case "name-desc":
                        classes = classes.OrderByDescending(c => c.Name);
                        break;
                    case "grade":
                        classes = classes.OrderBy(c => c.Grade);
                        break;
                    case "grade-desc":
                        classes = classes.OrderByDescending(c => c.Grade);
                        break;
                    case "year":
                        classes = classes.OrderBy(c => c.Year);
                        break;
                    case "year-desc":
                        classes = classes.OrderByDescending(c => c.Year);
                        break;
                    case "teacher":
                        classes = classes.OrderBy(c => c.Year);
                        break;
                    case "teacher-desc":
                        classes = classes.OrderByDescending(c => c.Name);
                        break;
                    default:
                        break;
                }
            }

            return classes;
        }

        public void CreateClass(Class classObj)
        {
            _unitOfWork.Class.Add(classObj);
            _unitOfWork.Complete();
        }

        public void DeleteClass(Class classObj)
        {
            _unitOfWork.Class.Remove(classObj);
            _unitOfWork.Complete();
        }

        public void Update()
        {
            _unitOfWork.Complete();
        }

        public Grade GetGrade(int gradeId)
        {
            return _unitOfWork.Class.GetGrade(gradeId);
        }

        public IEnumerable<Grade> GetGrades(string name)
        {
            return _unitOfWork.Class.GetGrades(name);
        }
    }
}
