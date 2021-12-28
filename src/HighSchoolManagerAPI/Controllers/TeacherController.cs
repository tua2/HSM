using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using ApplicationCore.Entities;
using HighSchoolManagerAPI.FrontEndModels;
using Microsoft.AspNetCore.Authorization;
using HighSchoolManagerAPI.Services.IServices;

namespace HighSchoolManagerAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    // [Authorize]
    public class TeacherController : ControllerBase
    {
        private readonly ITeacherService _teacherService;

        public TeacherController(ITeacherService teacherService)
        {
            _teacherService = teacherService;
        }

        // GET: api/Teacher/Get
        [HttpGet("Get")]
        public ActionResult GetTeachers(int? teacherId, string name, string gender, string sort)
        {
            // filter by teacherId
            if (teacherId != null)
            {
                var aTeacher = _teacherService.GetTeacher((int)teacherId);
                if (aTeacher == null)
                {
                    return NotFound();
                }
                return Ok(aTeacher);
            }

            // if studentId == null

            var teachers = _teacherService.GetTeachers(name, gender, sort);

            return Ok(teachers);
        }

        // PUT: api/Teacher/Edit?teacherId=5
        [HttpPut("Edit")]
        // [Authorize(Roles = "Manager, Teacher")]
        public ActionResult EditTeacher(int teacherId, TeacherModel model)
        {
            var teacher = _teacherService.GetTeacher(teacherId);

            // if no teacher is found
            if (teacher == null)
            {
                return NotFound();
            }

            // check if model matches with data annotation in front-end model
            if (ModelState.IsValid)
            {
                //bind value
                teacher.Name = model.Name;
                teacher.Gender = model.Gender;
                teacher.Birthday = model.Birthday;

                // save change
                _teacherService.Update();

                return Ok(teacher);
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

        // POST: api/Teacher/Create
        [HttpPost("Create")]
        [Authorize(Roles = "Manager, Admin")]
        public ActionResult CreateTeacher(TeacherModel model)
        {
            if (ModelState.IsValid)
            {
                Teacher teacher = new Teacher
                {
                    Name = model.Name,
                    Gender = model.Gender,
                    Birthday = model.Birthday
                };

                // create teacher
                _teacherService.CreateTeacher(teacher);

                return StatusCode(201, teacher); // 201: Created
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

        // DELETE: api/Teacher/Delete?teacherId=5
        [HttpDelete("Delete")]
        [Authorize(Roles = "Manager, Admin")]
        public ActionResult DeleteTeacher(int teacherId)
        {
            var teacher = _teacherService.GetTeacher(teacherId);

            // if no teacher is found
            if (teacher == null)
            {
                return NotFound();
            }

            // delete teacher
            _teacherService.DeleteTeacher(teacher);

            return Ok();
        }
    }
}
