using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ApplicationCore.Entities;
using HighSchoolManagerAPI.Services.IServices;
using HighSchoolManagerAPI.FrontEndModels;
using HighSchoolManagerAPI.Helpers;

namespace HighSchoolManagerAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    // [Authorize(Roles = "Manager, Teacher")] // giáo vụ, giáo viên
    public class StudentController : ControllerBase
    {
        private readonly IStudentService _studentService;
        private ResponseHelper resp;

        public StudentController(IStudentService studentService)
        {
            _studentService = studentService;
            resp = new ResponseHelper();
        }

        // Return a student or not found if filter by studentId
        // Return a list of student or empty list if filter by others
        // Get students that are not in class -> classId = 0
        [HttpGet("Get")]
        public ActionResult GetStudents(int? studentId, string name, int? gradeId, int? classId, int? year, string sort)
        {
            if (studentId != null)
            {
                var aStudent = _studentService.GetStudent((int)studentId);
                if (aStudent == null)
                {
                    return NotFound();
                }
                return Ok(aStudent);
            }

            var students = _studentService.GetStudents(name, gradeId, classId, year, sort);
            return Ok(students);
        }

        [HttpPost("Create")]
        // [Authorize(Roles = "Manager")]
        public ActionResult CreateStudent(StudentModel model)
        {
            if (ModelState.IsValid)
            {
                Student student = new Student
                {
                    FirstName = model.FirstName,
                    LastName = model.LastName,
                    Gender = model.Gender,
                    Birthday = model.Birthday,
                    Address = model.Address,
                    ClassID = model.ClassID
                };
                _studentService.CreateStudent(student);
                return StatusCode(201, student); // 201: Created
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
        // [Authorize(Roles = "Manager")]
        public ActionResult EditStudent(int studentId, StudentModel model)
        {
            var student = _studentService.GetStudent(studentId);

            // if no student is found
            if (student == null)
            {
                return NotFound();
            }

            // check if model matches with data annotation in front-end model
            if (ModelState.IsValid)
            {
                //(new) HOÀNG: "edit directly"
                student.FirstName = model.FirstName;
                student.LastName = model.LastName;
                student.Gender = model.Gender;
                student.Birthday = model.Birthday;
                student.Address = model.Address;
                student.EnrollDate = model.EnrollDate;
                student.ClassID = model.ClassID;

                _studentService.Update();

                return Ok(student);
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
        [Authorize(Roles = "Manager")]
        public ActionResult Delete(int studentId)
        {
            var student = _studentService.GetStudent(studentId);

            // if no student is found
            if (student == null)
            {
                return NotFound();
            }

            _studentService.DeleteStudent(student);

            return Ok(student);
        }
    }
}
