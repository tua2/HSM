using System.Linq;
using ApplicationCore.Entities;
using ApplicationCore.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories
{
    public class ResultRepository : Repository<Result>, IResultRepository
    {
        public ResultRepository(HighSchoolContext context) : base(context)
        {
        }

        new public Result GetBy(int id)
        {
            var result = HighSchoolContext.Results
                    .Include(r => r.ResultDetails)
                    .ThenInclude(d => d.ResultType)
                    .FirstOrDefault(rs => rs.ResultID == id);

            return result;
        }

        public ResultType GetResultType(int resultTypeId)
        {
            return HighSchoolContext.ResultTypes.Find(resultTypeId);
        }

        // Get result detail of subject(resultId) by result type and month
        public ResultDetail GetResultDetail(int resultId, int resultTypeId, int month)
        {
            return HighSchoolContext.ResultDetails
                .Where(d => d.ResultID == resultId && d.ResultTypeID == resultTypeId && d.Month == month)
                .Include(d => d.ResultType)
                .FirstOrDefault();
        }

        public IQueryable<ResultDetail> GetResultDetails(int resultId, int month)
        {
            return HighSchoolContext.ResultDetails
                .Where(d => d.ResultID == resultId && d.Month == month)
                .Include(d => d.ResultType);
        }

        public void AddDetail(ResultDetail detail)
        {
            HighSchoolContext.ResultDetails.Add(detail);
        }

        public IQueryable<ResultType> GetAllResultTypes()
        {
            return HighSchoolContext.ResultTypes;
        }

        protected HighSchoolContext HighSchoolContext
        {
            get { return Context as HighSchoolContext; }
        }
    }
}