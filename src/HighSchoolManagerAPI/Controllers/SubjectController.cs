using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using ApplicationCore.Entities;
using HighSchoolManagerAPI.FrontEndModels;
using HighSchoolManagerAPI.Services.IServices;

namespace HighSchoolManagerAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    // [Authorize]
    public class SubjectController : ControllerBase
    {
        private readonly ISubjectService _subjectService;

        public SubjectController(ISubjectService subjectService)
        {
            _subjectService = subjectService;
        }

        // GET: api/Subject/Get
        [HttpGet("Get")]
        public ActionResult GetSubjects(int? subjectId, string name, string sort)
        {
            // filter by subjectId
            if (subjectId != null)
            {
                var aSubject = _subjectService.GetSubject((int)subjectId);
                if (aSubject == null)
                {
                    return NotFound();
                }
                return Ok(aSubject);
            }

            // if studentId == null

            var subjects = _subjectService.GetSubjects(name, sort);

            return Ok(subjects);
        }

        // PUT: api/Subject/Edit?subjectId=5
        [HttpPut("Edit")]
        // [Authorize(Roles = "Manager, Subject")]
        public ActionResult EditSubject(int subjectId, SubjectModel model)
        {
            var subject = _subjectService.GetSubject(subjectId);

            // if no subject is found
            if (subject == null)
            {
                return NotFound();
            }

            // check if model matches with data annotation in front-end model
            if (ModelState.IsValid)
            {
                // bind value
                subject.Name = model.Name;

                // save change
                _subjectService.Update();

                return Ok(subject);
            }
            else
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

        // POST: api/Subject/Create
        [HttpPost("Create")]
        // [Authorize(Roles = "Manager")]
        public ActionResult CreateSubject(SubjectModel model)
        {
            if (ModelState.IsValid)
            {
                Subject subject = new Subject
                {
                    Name = model.Name
                };

                // create subject
                _subjectService.CreateSubject(subject);

                return StatusCode(201); // 201: Created
            }
            else
            {
                // response helper method
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

        // DELETE: api/Subject/Delete?subjectId=5
        [HttpDelete("Delete")]
        // [Authorize(Roles = "Manager")]
        public ActionResult DeleteSubject(int subjectId)
        {
            var subject = _subjectService.GetSubject(subjectId);

            // if no subject is found
            if (subject == null)
            {
                return NotFound();
            }

            // delete subject
            _subjectService.DeleteSubject(subject);

            return Ok();
        }
    }
}
