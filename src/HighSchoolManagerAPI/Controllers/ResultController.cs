using Microsoft.AspNetCore.Mvc;
using HighSchoolManagerAPI.Services.IServices;
using HighSchoolManagerAPI.FrontEndModels;
using System.Collections.Generic;
using ApplicationCore.Entities;
using HighSchoolManagerAPI.Helpers;
using System.Linq;
using System;
using System.Reflection;

namespace HighSchoolManagerAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    // [Authorize(Roles = "Manager, Teacher")]
    public class ResultController : ControllerBase
    {
        private readonly IResultService _resultService;
        private readonly IExistHelper _exist;
        private readonly ResponseHelper resp;
        public ResultController(IResultService resultService, IExistHelper exist)
        {
            _resultService = resultService;
            _exist = exist;
            resp = new ResponseHelper();
        }

        // GET: api/Result/Get
        [HttpGet("Get")]
        public ActionResult GetResults(int? resultId, int? studentId, int? semesterId, int? subjectId, string sort)
        {
            // filter by resultId
            if (resultId != null)
            {
                var result = _resultService.GetResult((int)resultId);
                if (result == null)
                {
                    return NotFound();
                }
                return Ok(result);
            }

            // if resultId == null
            var results = _resultService.GetResults(studentId, semesterId, subjectId, sort);

            return Ok(results);
        }

        [HttpPost("UpdateMark")]
        public ActionResult UpdateMark(UpdateMarkModel model)
        {
            if (ModelState.IsValid)
            {
                if (!IsKeyValid(model))
                {
                    return StatusCode(resp.code, resp);
                }
                else
                {
                    // get result filter with resultDetail.month
                    var result = _resultService.GetResult(model.StudentID, model.SubjectID, model.SemesterID, model.Month);

                    // Create new result if not exist
                    if (result == null)
                    {
                        result = new Result
                        {
                            StudentID = model.StudentID,
                            SemesterID = model.SemesterID,
                            SubjectID = model.SubjectID
                        };

                        _resultService.CreateResult(result);

                        // get again for included entities
                        result = _resultService.GetResults(model.StudentID, model.SemesterID, model.SubjectID, null)
                                .AsQueryable()
                                .FirstOrDefault();
                    }

                    // details
                    var detail = _resultService.GetResultDetail(result.ResultID, model.ResultTypeID, model.Month);

                    // create detail if not exist
                    if (detail == null)
                    {
                        // Check for valid month - semester
                        if (result.Semester.Label == 1)
                        {
                            if (!(model.Month >= 9 && model.Month <= 12))
                            {
                                resp.code = 400; // Bad Request
                                resp.messages.Add(new { Month = "Month " + model.Month + " - Semester " + result.Semester.Label + " is invalid" });
                                return BadRequest(resp);
                            }
                        }
                        else
                        {
                            if (!(model.Month >= 2 && model.Month <= 5))
                            {
                                resp.code = 400; // Bad Request
                                resp.messages.Add(new { Month = "Month " + model.Month + " - Semester " + result.Semester.Label + " is invalid" });
                                return BadRequest(resp);
                            }
                        }

                        _resultService.CreateResultDetails(result, model.Month);
                        detail = _resultService.GetResultDetail(result.ResultID, model.ResultTypeID, model.Month);
                    }

                    // update mark
                    detail.Mark = model.Mark;
                    _resultService.Update();

                    _resultService.CalculateSubjectMonthlyAverage(result);

                    return Ok(detail);
                }
            }
            else // ModelState is invalid
            {
                var errors = new List<string>();
                foreach (var state in ModelState)
                {
                    foreach (var error in state.Value.Errors)
                    {
                        errors.Add(error.ErrorMessage);
                    }
                }
                return BadRequest(errors);
            }
        }

        // GET: api/Result/SubjectMonthlyAverage?studentId=1&subjectId=1&semesterId=1&month=1
        [HttpGet("SubjectMonthlyAverage")]
        public ActionResult SubjectMonthlyAverage(int studentId, int subjectId, int semesterId, int month)
        {
            var result = _resultService.GetResult(studentId, subjectId, semesterId, month);

            // return average = null if no result found
            if (result == null)
            {
                double? avg_temp = null;
                Object subjectMonthlyResult_temp = new
                {
                    average = avg_temp
                };
                return Ok(avg_temp);
            }

            Object subjectMonthlyResult = new
            {
                studentId = result.StudentID,
                subjectId = result.SubjectID,
                semesterId = result.SemesterID,
                resultDetails = result.ResultDetails
            };

            return Ok(subjectMonthlyResult);
        }

        [HttpGet("SubjectMonthlyAverages")]
        public ActionResult SubjectMonthlyAverages(int studentId, int subjectId, int year)
        {
            var results = _resultService.GetResultsWithYear(studentId, subjectId, year, 1);

            List<object> details = new List<object>();

            foreach (var r in results)
            {
                foreach (var d in r.ResultDetails)
                {
                    details.Add(new
                    {
                        month = d.Month,
                        average = d.MonthlyAverage
                    });
                }
            }

            object subjectMonthlyAverages = new
            {
                studentId = studentId,
                subjectId = subjectId,
                year = year,
                averages = details
            };

            return Ok(subjectMonthlyAverages);
        }

        [HttpGet("SubjectYearlyAverages")]
        public ActionResult SubjectYearlyAverages(int studentId, int subjectId, int year)
        {
            double? tmpAvg = null; // semester avg
            double? markSemester1 = null;
            double? markSemester2 = null;
            double monthCount = 4; // semester = 1 (9, 10, 11, 12); semester = 2 (2, 3, 4, 5)
            List<object> subjectSemesterAverages = new List<object>();

            var results = _resultService.GetResultsWithYear(studentId, subjectId, year, null);

            // if no results found
            if (results.Count() == 0)
            {
                tmpAvg = null;
                for (int i = 1; i <= 3; i++)
                {
                    subjectSemesterAverages.Add(new
                    {
                        semesterIndex = i,
                        average = tmpAvg
                    });
                }
                return Ok(subjectSemesterAverages);
            }

            // semester 1, 2 averages
            foreach (var r in results)
            {
                if (r.ResultDetails.Count(d => d.MonthlyAverage != null && d.ResultType.Coefficient == 1) == monthCount)
                {
                    tmpAvg = _resultService.CalculateSubjectSemesterSum(r.ResultDetails);
                }
                else
                {
                    tmpAvg = null;
                }

                // save to database
                r.Average = tmpAvg;
                _resultService.Update();

                subjectSemesterAverages.Add(new
                {
                    semesterIndex = r.Semester.Label,
                    average = tmpAvg
                });

                // if have only 1 result
                if (results.Count() == 1)
                {
                    if (r.Semester.Label == 1)
                    {
                        tmpAvg = null;
                        subjectSemesterAverages.Add(new
                        {
                            semesterIndex = 2,
                            average = tmpAvg
                        });
                        markSemester2 = tmpAvg;
                    }
                    else
                    {
                        tmpAvg = null;
                        subjectSemesterAverages.Add(new
                        {
                            semesterIndex = 1,
                            average = tmpAvg
                        });
                        markSemester1 = tmpAvg;
                    }
                }
                else
                {
                    if (r.Semester.Label == 1)
                    {
                        markSemester1 = tmpAvg;
                    }
                    else
                    {
                        markSemester2 = tmpAvg;
                    }
                }
            }

            // year average
            tmpAvg = _resultService.CalculateSubjectYearSum(markSemester1, markSemester2);
            subjectSemesterAverages.Add(new
            {
                semesterIndex = 3,
                average = tmpAvg
            });

            return Ok(subjectSemesterAverages);
        }

        private bool IsKeyValid(UpdateMarkModel model)
        {
            // check for student
            if (!_exist.StudentExists(model.StudentID))
            {
                resp.code = 404; // Not found
                resp.messages.Add("Student not found");
            }

            // check for subject
            if (!_exist.SubjectExists(model.SubjectID))
            {
                resp.code = 404; // Not found
                resp.messages.Add("Subject not found");
            }

            // check for semester
            if (!_exist.SemesterExists(model.SemesterID))
            {
                resp.code = 404; // Not found
                resp.messages.Add("Semester not found");
            }

            // check for result type
            if (!_exist.ResultTypeExists(model.ResultTypeID))
            {
                resp.code = 404; // Not found
                resp.messages.Add("Result Type not found");
            }

            return true;
        }
    }

}