using ApplicationCore.Entities;
using ApplicationCore.Interfaces;

namespace Infrastructure.Persistence.Repositories
{
    public class SubjectRepository : Repository<Subject>, ISubjectRepository
    {
        public SubjectRepository(HighSchoolContext context) : base(context)
        {
        }

        protected HighSchoolContext HighSchoolContext
        {
            get { return Context as HighSchoolContext; }
        }
    }
}