using ApplicationCore.Entities;
using ApplicationCore.Interfaces;

namespace Infrastructure.Persistence.Repositories
{
    public class TeachingAssignmentRepository : Repository<TeachingAssignment>, ITeachingAssignmentRepository
    {
        public TeachingAssignmentRepository(HighSchoolContext context) : base(context)
        {
        }

        protected HighSchoolContext HighSchoolContext
        {
            get { return Context as HighSchoolContext; }
        }
    }
}