using ApplicationCore.Entities;
using ApplicationCore.Interfaces;

namespace Infrastructure.Persistence.Repositories
{
    public class StudentRepository : Repository<Student>, IStudentRepository
    {
        public StudentRepository(HighSchoolContext context) : base(context)
        {
        }
        protected HighSchoolContext HighSchoolContext
        {
            get { return Context as HighSchoolContext; }
        }
    }
}