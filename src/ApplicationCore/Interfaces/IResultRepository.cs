using System.Linq;
using ApplicationCore.Entities;

namespace ApplicationCore.Interfaces
{
    public interface IResultRepository : IRepository<Result>
    {
        ResultType GetResultType(int resultTypeId);
        ResultDetail GetResultDetail(int resultId, int resultTypeId, int month);
        IQueryable<ResultDetail> GetResultDetails(int resultId, int month);
        IQueryable<ResultType> GetAllResultTypes();
        void AddDetail(ResultDetail detail);
    }
}