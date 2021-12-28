using System.Linq;
using System.Collections.Generic;
using ApplicationCore.Entities;
using ApplicationCore.Interfaces;
using System;

namespace Infrastructure.Persistence.Repositories
{
    public class ClassRepository : Repository<Class>, IClassRepository
    {
        public ClassRepository(HighSchoolContext context) : base(context)
        {
        }

        public Class GetByNameAndYear(string name, int year)
        {
            var aClass =
                HighSchoolContext.Classes
                .Where(c => c.Name.Equals(name))
                .Where(c => c.Year == year);

            return aClass.FirstOrDefault();
        }

        public Class GetByHeadTeacher(int id)
        {
            var aClass =
                HighSchoolContext.Classes
                .Where(c => c.HeadTeacherID == id);

            return aClass.FirstOrDefault();
        }

        public Grade GetGrade(int gradeId)
        {
            return HighSchoolContext.Grades.Find(gradeId);
        }

        public IEnumerable<Grade> GetGrades(string name)
        {
            var grades = HighSchoolContext.Grades
                .OrderBy(g => g.GradeID)
                .Distinct();
            if (!String.IsNullOrEmpty(name))
            {
                grades = grades.Where(g => g.Name.Equals(name));
            }
            return grades;
        }

        protected HighSchoolContext HighSchoolContext
        {
            get { return Context as HighSchoolContext; }
        }
    }
}