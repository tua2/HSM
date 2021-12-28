using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using ApplicationCore.Entities;
using HighSchoolManagerAPI.FrontEndModels;
using HighSchoolManagerAPI.Services.IServices;
using HighSchoolManagerAPI.Helpers;

namespace HighSchoolManagerAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    // [Authorize]
    public class SemesterController : ControllerBase
    {
        private readonly ISemesterService _semesterService;
        private readonly IExistHelper _exist;
        private readonly ResponseHelper resp;

        public SemesterController(ISemesterService semesterService, IExistHelper exist)
        {
            _semesterService = semesterService;
            _exist = exist;
            resp = new ResponseHelper();
        }

        // GET: api/Semester/Get
        [HttpGet("Get")]
        public ActionResult GetSemesters(int? label, int? year)
        {
            var semesters = _semesterService.GetSemesters(label, year);

            return Ok(semesters);
        }

        [HttpPost("NewYear")]
        public ActionResult CreateNewYear(int year)
        {
            if (year != 0)
            {
                // semester 1
                Semester semester1 = new Semester()
                {
                    Label = 1,
                    Year = year
                };

                // if exist -> do nothing
                if (!_exist.SemesterExists(semester1.Label, semester1.Year))
                {
                    _semesterService.CreateSemester(semester1);
                }
                else
                {
                    resp.code = 400; // Bad request
                    resp.messages.Add(new { year = "Semester already exist" });
                    return BadRequest(resp);
                }

                // semester 2
                Semester semester2 = new Semester()
                {
                    Label = 2,
                    Year = year
                };

                // if exist -> do nothing
                if (!_exist.SemesterExists(semester2.Label, semester2.Year))
                {
                    _semesterService.CreateSemester(semester2);
                }
                else
                {
                    resp.code = 400; // Bad request
                    resp.messages.Add(new { year = "Semester already exist" });
                    return BadRequest(resp);
                }
            }

            return Ok();
        }
    }
}
