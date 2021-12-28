using System.Collections.Generic;
using System.Linq;
using ApplicationCore.Entities;
using ApplicationCore.Interfaces;
using HighSchoolManagerAPI.Services.IServices;
using Microsoft.EntityFrameworkCore;

namespace HighSchoolManagerAPI.Services
{
    public class TeachingAssignmentService : ITeachingAssignmentService
    {
        private readonly IUnitOfWork _unitOfWork;

        public TeachingAssignmentService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public void CreateTeachingAssignment(TeachingAssignment teachingAssignment)
        {
            _unitOfWork.TeachingAssignment.Add(teachingAssignment);
            _unitOfWork.Complete();
        }

        public void DeleteTeachingAssignment(TeachingAssignment teachingAssignment)
        {
            _unitOfWork.TeachingAssignment.Remove(teachingAssignment);
            _unitOfWork.Complete();
        }

        public TeachingAssignment GetTeachingAssignment(int teachingAssignmentId)
        {
            return _unitOfWork.TeachingAssignment.GetBy(teachingAssignmentId);
        }

        public TeachingAssignment GetTeachingAssignment(int teacherId, int classId, int subjectId)
        {
            var teachingAssign = _unitOfWork.TeachingAssignment.GetAll();
            teachingAssign = teachingAssign.Where(t => t.TeacherID == teacherId)
                                    .Where(t => t.ClassID == classId)
                                    .Where(t => t.SubjectID == subjectId);
            teachingAssign = teachingAssign.Include(t => t.Class).Include(t => t.Teacher).Include(t => t.Subject);

            return teachingAssign.FirstOrDefault();
        }

        public IEnumerable<TeachingAssignment> GetTeachingAssignments(int? teacherId, int? classId, int? subjectId, string sort)
        {
            var teachingAssign = _unitOfWork.TeachingAssignment.GetAll();

            if (teacherId != null)
            {
                teachingAssign = teachingAssign.Where(t => t.TeacherID == teacherId);
            }

            if (classId != null)
            {
                teachingAssign = teachingAssign.Where(t => t.ClassID == classId);
            }

            if (subjectId != null)
            {
                teachingAssign = teachingAssign.Where(t => t.SubjectID == subjectId);
            }

            teachingAssign = teachingAssign.OrderBy(t => t.TeachingAssignmentID);

            switch (sort)
            {
                case "teacher":
                    teachingAssign = teachingAssign.OrderBy(t => t.Teacher.Name);
                    break;
                case "teacher-desc":
                    teachingAssign = teachingAssign.OrderByDescending(t => t.Teacher.Name);
                    break;
                case "class":
                    teachingAssign = teachingAssign.OrderBy(t => t.Class.Name);
                    break;
                case "class-desc":
                    teachingAssign = teachingAssign.OrderByDescending(t => t.Class.Name);
                    break;
                case "subject":
                    teachingAssign = teachingAssign.OrderBy(t => t.Subject.Name);
                    break;
                case "subject-desc":
                    teachingAssign = teachingAssign.OrderByDescending(t => t.Subject.Name);
                    break;
                default:
                    break;
            }

            teachingAssign = teachingAssign.Include(t => t.Class).Include(t => t.Teacher).Include(t => t.Subject);

            return teachingAssign;
        }

        public void Update()
        {
            _unitOfWork.Complete();
        }
    }
}