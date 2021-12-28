using System;
using System.Collections.Generic;
using System.Linq;
using ApplicationCore.Entities;
using ApplicationCore.Interfaces;
using HighSchoolManagerAPI.FrontEndModels;
using HighSchoolManagerAPI.Services.IServices;
using Microsoft.EntityFrameworkCore;
using Z.EntityFramework.Plus;

namespace HighSchoolManagerAPI.Services
{
    public class ResultService : IResultService
    {
        private readonly IUnitOfWork _unitOfWork;
        public ResultService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public Result GetResult(int resultId)
        {
            var result = _unitOfWork.Result.GetBy(resultId);

            return result;
        }

        public Result GetResult(int studentId, int subjectId, int semesterId, int month)
        {
            var result = _unitOfWork.Result.GetAll();
            result = result.Where(r => r.StudentID == studentId);
            result = result.Where(r => r.SubjectID == subjectId);
            result = result.Where(r => r.SemesterID == semesterId);

            result = result
                    .IncludeFilter(r => r.ResultDetails.Where(d => d.Month == month).Select(d => d.ResultType));


            return result.FirstOrDefault();
        }

        public IEnumerable<Result> GetResultsWithYear(int studentId, int subjectId, int year, int? resultTypeId)
        {
            var results = _unitOfWork.Result.GetAll();
            results = results.Where(r => r.StudentID == studentId);
            results = results.Where(r => r.SubjectID == subjectId);
            results = results.Where(r => r.Semester.Year == year);

            results = results.Include(r => r.Semester);

            if (resultTypeId != null)
            {
                results = results.IncludeFilter(r => r.ResultDetails.Where(d => d.ResultTypeID == resultTypeId).Select(d => d.ResultType));
            }
            else
            {
                results = results.IncludeFilter(r => r.ResultDetails.Select(d => d.ResultType));
            }

            return results;
        }

        public IEnumerable<Result> GetResults(int? studentId, int? semesterId, int? subjectId, string sort)
        {
            var results = _unitOfWork.Result.GetAll();

            // filter by stundentId
            if (studentId != null)
            {
                results = results.Where(r => r.StudentID == studentId);
            }

            // filter by semestertId
            if (semesterId != null)
            {
                results = results.Where(r => r.SemesterID == semesterId);
            }

            // filter by subjectId
            if (subjectId != null)
            {
                results = results.Where(r => r.SubjectID == subjectId);
            }

            // order by ResultID
            results = results.OrderBy(r => r.ResultID);
            // order by others
            if (!string.IsNullOrEmpty(sort))
            {
                switch (sort)
                {
                    case "student":
                        results = results.OrderBy(r => r.StudentID);
                        break;
                    case "student-desc":
                        results = results.OrderByDescending(r => r.StudentID);
                        break;
                    case "semester":
                        results = results.OrderBy(r => r.SemesterID);
                        break;
                    case "semester-desc":
                        results = results.OrderByDescending(r => r.SemesterID);
                        break;
                    case "subject":
                        results = results.OrderBy(r => r.SubjectID);
                        break;
                    case "subject-desc":
                        results = results.OrderByDescending(r => r.SubjectID);
                        break;
                    default:
                        break;
                }
            }

            results = results.Include(r => r.ResultDetails).ThenInclude(d => d.ResultType);

            return results;
        }

        public void CreateResult(Result result)
        {
            _unitOfWork.Result.Add(result);
            _unitOfWork.Complete();
        }

        public ResultDetail GetResultDetail(int resultId, int resultTypeId, int month)
        {
            return _unitOfWork.Result.GetResultDetail(resultId, resultTypeId, month);
        }

        public IEnumerable<ResultDetail> GetResultDetails(int resultId, int month)
        {
            return _unitOfWork.Result.GetResultDetails(resultId, month);
        }

        public void CreateDetail(ResultDetail detail)
        {
            _unitOfWork.Result.AddDetail(detail);
            _unitOfWork.Complete();
        }

        public void Update()
        {
            _unitOfWork.Complete();
        }

        public void CreateResultDetails(Result result, int month)
        {
            var resultTypes = this.GetAllResultTypes();
            foreach (var t in resultTypes)
            {
                if (t.Coefficient != 3)
                {
                    var detail = new ResultDetail
                    {
                        ResultID = result.ResultID,
                        ResultTypeID = t.ResultTypeID,
                        Month = month
                    };
                    _unitOfWork.Result.AddDetail(detail);
                }
                else
                {
                    if (month == 12 || month == 5)
                    {
                        var detail = new ResultDetail
                        {
                            ResultID = result.ResultID,
                            ResultTypeID = t.ResultTypeID,
                            Month = month
                        };
                        _unitOfWork.Result.AddDetail(detail);
                    }
                }
            }
            _unitOfWork.Complete();
        }

        public IEnumerable<ResultType> GetAllResultTypes()
        {
            return _unitOfWork.Result.GetAllResultTypes();
        }

        // result filtered with resultDetail.month
        public double? CalculateSubjectMonthlyAverage(Result result)
        {
            var markColumns = 2; // số cột điểm 
            double? avg = 0;
            if (result.ResultDetails.Count(d => d.Mark != null && d.ResultType.Coefficient != 3) == markColumns)
            {
                double sum = 0;
                double coefficients = 0;

                foreach (var d in result.ResultDetails)
                {
                    if (d.ResultType.Coefficient == 1 || d.ResultType.Coefficient == 2)
                    {
                        sum += (double)d.Mark * d.ResultType.Coefficient;
                        coefficients += d.ResultType.Coefficient;
                    }
                }

                avg = Math.Round(sum / coefficients, 1);
            }
            else
            {
                avg = null;
            }

            // save to db base
            foreach (var d in result.ResultDetails)
            {
                if (d.ResultType.Coefficient == 1 || d.ResultType.Coefficient == 2)
                {
                    d.MonthlyAverage = avg;
                }
            }

            _unitOfWork.Complete();

            return avg;
        }

        // Calculate suubject result of semester
        public double? CalculateSubjectSemesterSum(IEnumerable<ResultDetail> details)
        {
            double? sum = 0;
            double? tmpAvg = null;
            double? markExam = null;
            double monthCount = 4; // semester = 1 (9, 10, 11, 12); semester = 2 (2, 3, 4, 5)

            foreach (var d in details)
            {
                if (d.ResultType.Coefficient == 1)
                {
                    sum += (double)d.MonthlyAverage;
                }
                else if (d.ResultType.Coefficient == 3)
                {
                    markExam = d.Mark;
                }
            }

            if (markExam != null)
            {
                tmpAvg = (double)sum / monthCount;
                tmpAvg = (tmpAvg * 2 + markExam) / 3;
                tmpAvg = Math.Round((double)tmpAvg, 1);
            }

            return tmpAvg;
        }

        // Calculate subject result of year
        public double? CalculateSubjectYearSum(double? markSemester1, double? markSemester2)
        {
            double? sum = null;

            if (markSemester1 == null || markSemester2 == null)
            {
                sum = null;
                return sum;
            }
            else
            {
                sum = (markSemester1 + markSemester2) / 2;
                return Math.Round((double)sum, 1);
            }
        }

        // input: list of subject avg (by student, month)
        public double? CalculateStudentAverage(List<ResultAverage> resultAverages, int numOfSubject)
        {
            // if there is any null average
            if (resultAverages.Count(r => r.average == null) > 0)
            {
                return null;
            }

            double sum = 0;
            double average = 0;

            foreach (var r in resultAverages)
            {
                sum += (double)r.average;
            }

            average = Math.Round(sum / numOfSubject, 1);

            return average;
        }
    }
}