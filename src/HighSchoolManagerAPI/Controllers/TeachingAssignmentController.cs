using System.Collections.Generic;
using ApplicationCore.Entities;
using HighSchoolManagerAPI.FrontEndModels;
using HighSchoolManagerAPI.Helpers;
using HighSchoolManagerAPI.Services.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HighSchoolManagerAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TeachingAssignmentController : ControllerBase
    {
        private readonly ITeachingAssignmentService _teachingAssignmentService;
        private readonly IExistHelper _exist;
        private readonly ResponseHelper _resp;

        public TeachingAssignmentController(ITeachingAssignmentService teachingAssignmentService, IExistHelper exist)
        {
            _teachingAssignmentService = teachingAssignmentService;
            _exist = exist;
            _resp = new ResponseHelper();
        }

        // GET: api/TeachingAssignment/Get
        [HttpGet("Get")]
        public ActionResult GetTeachingAssignments(int? teachingAssignmentId, int? teacherId, int? classId, int? subjectId, string sort)
        {
            // filter by teachingAssignmentId
            if (teachingAssignmentId != null)
            {
                var teachingAssign = _teachingAssignmentService.GetTeachingAssignment((int)teachingAssignmentId);
                if (teachingAssign == null)
                {
                    return NotFound();
                }
                return Ok(teachingAssign);
            }

            // if teachingAssignmentId == null

            var teachingAssigns = _teachingAssignmentService.GetTeachingAssignments(teacherId, classId, subjectId, sort);

            return Ok(teachingAssigns);
        }

        [HttpPost("Create")]
        // [Authorize(Roles = "Manager")]
        public ActionResult CreateTeachingAssignment(TeachingAssignmentModel model)
        {
            if (ModelState.IsValid)
            {
                if (!IsKeyValid(model))
                {
                    return StatusCode(_resp.code, _resp);
                }

                if (_exist.TeachingAssignmentExist(model.TeacherID, model.ClassID, model.SubjectID))
                {
                    _resp.code = 400; // 400: Bad Request
                    _resp.messages.Add("Invalid unique key");
                    return BadRequest(_resp);
                }

                TeachingAssignment teachingAssign = new TeachingAssignment
                {
                    TeacherID = model.TeacherID,
                    ClassID = model.ClassID,
                    SubjectID = model.SubjectID
                };

                // create teacher
                _teachingAssignmentService.CreateTeachingAssignment(teachingAssign);

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

        [HttpPut("Edit")]
        public ActionResult EditTeachingAssignment(int assignmentId, TeachingAssignmentModel model)
        {
            var oldAssignment = _teachingAssignmentService.GetTeachingAssignment(assignmentId);

            // if no class is found
            if (oldAssignment == null)
            {
                return NotFound();
            }

            // check if foreign key(s), unique key(s) are invalid
            if (!IsKeyValid(model))
            {
                return StatusCode(_resp.code, _resp);
            }

            // check if model matches with data annotation in front-end model
            if (ModelState.IsValid)
            {
                var newAssignment = new TeachingAssignment(oldAssignment);

                newAssignment.TeacherID = model.TeacherID;
                newAssignment.ClassID = model.ClassID;
                newAssignment.SubjectID = model.SubjectID;

                // check for (teacherId, classId, subjectId)
                if (newAssignment.TeacherID != oldAssignment.TeacherID || newAssignment.ClassID != oldAssignment.ClassID || newAssignment.SubjectID != oldAssignment.SubjectID)
                {
                    if (_exist.TeachingAssignmentExist(newAssignment.TeacherID, newAssignment.ClassID, newAssignment.SubjectID))
                    {
                        _resp.code = 400; // bad request
                        _resp.messages.Add(new { Teacher = "Already assign teacher for this class with this subject" });
                        return StatusCode(_resp.code, _resp);
                    }
                }

                // bind value(s)
                oldAssignment.TeacherID = newAssignment.TeacherID;
                oldAssignment.ClassID = newAssignment.ClassID;
                oldAssignment.SubjectID = newAssignment.SubjectID;

                _teachingAssignmentService.Update();

                return Ok(oldAssignment);
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

        [HttpDelete("Delete")]
        public ActionResult DeleteTeachingAssigment(int teachingAssignmentId)
        {
            var assignment = _teachingAssignmentService.GetTeachingAssignment(teachingAssignmentId);
            if (assignment == null)
            {
                return NotFound();
            }

            _teachingAssignmentService.DeleteTeachingAssignment(assignment);
            return Ok();
        }


        private bool IsKeyValid(TeachingAssignmentModel model)
        {
            if (!_exist.TeacherExists(model.TeacherID))
            {
                _resp.code = 404;
                _resp.messages.Add("Teacher not found");
                return false;
            }

            if (!_exist.ClassExists(model.ClassID))
            {
                _resp.code = 404;
                _resp.messages.Add("Class not found");
                return false;
            }

            if (!_exist.SubjectExists(model.SubjectID))
            {
                _resp.code = 404;
                _resp.messages.Add("Subject not found");
                return false;
            }

            return true;
        }
    }
}