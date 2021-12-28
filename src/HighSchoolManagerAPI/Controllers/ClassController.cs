using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using ApplicationCore.Entities;
using HighSchoolManagerAPI.FrontEndModels;
using HighSchoolManagerAPI.Helpers;
using HighSchoolManagerAPI.Services.IServices;

namespace HighSchoolManagerAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClassController : ControllerBase
    {
        private readonly IClassService _classService;
        private readonly IStudentService _studentService;
        private ResponseHelper resp;
        private IExistHelper exist;

        public ClassController(IClassService classService, IStudentService studentService, IExistHelper exist)
        {
            _classService = classService;
            _studentService = studentService;
            this.resp = new ResponseHelper();
            this.exist = exist;
        }

        // GET: api/Class/Get -> Get all classes
        // GET: api/Class/Get?classId=2
        [HttpGet("Get")]
        public ActionResult GetClasses(int? classId, string name, int? year, int? gradeId, int? headTeacherId, string sort)
        {
            // filter by classId
            if (classId != null)
            {
                var aClass = _classService.GetClass((int)classId);
                if (aClass == null)
                {
                    return NotFound();
                }
                return Ok(aClass);
            }
            // if classId == null
            var classes = _classService.GetClasses(classId, name, year, gradeId, headTeacherId, sort);

            return Ok(classes);
        }

        // PUT: api/Class/Edit?classId=5
        [HttpPut("Edit")]
        public IActionResult EditClass(int classId, ClassModel model)
        {
            var oldClass = _classService.GetClass(classId);

            // if no class is found
            if (oldClass == null)
            {
                return NotFound();
            }

            // check if foreign key(s), unique key(s) are invalid
            if (!IsEditKeysValid(model))
            {
                return StatusCode(resp.code, resp);
            }

            // check if model matches with data annotation in front-end model
            if (ModelState.IsValid)
            {
                var newClass = new Class(oldClass);

                newClass.Name = model.Name;
                newClass.Year = model.Year;
                newClass.GradeID = model.GradeID;
                newClass.HeadTeacherID = model.HeadTeacherID;

                // check for (Name, Year)
                if (newClass.Name != oldClass.Name || newClass.Year != oldClass.Year)
                {
                    if (exist.ClassExists(newClass.Name, newClass.Year))
                    {
                        resp.code = 400; // bad request
                        resp.messages.Add(new { Name = "Already have class " + model.Name + " in " + model.Year });
                        return StatusCode(resp.code, resp);
                    }
                }

                // check if Head Teacher is not belong to another class
                if (newClass.HeadTeacherID != oldClass.HeadTeacherID && newClass.HeadTeacherID != null)
                {
                    // check if Head Teacher is not belong to another class
                    if (exist.HeadTeacherExists((int)model.HeadTeacherID))
                    {
                        resp.code = 400; //Bad Request
                        resp.messages.Add(new { HeadTeacherID = "Head teacher is belong to another class" });
                        return StatusCode(resp.code, resp);
                    }
                }

                // bind value(s)
                oldClass.Name = newClass.Name;
                oldClass.Year = newClass.Year;
                oldClass.GradeID = newClass.GradeID;
                oldClass.HeadTeacherID = newClass.HeadTeacherID;

                _classService.Update();

                return Ok(oldClass);
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

        // POST: api/Class/Create
        [HttpPost("Create")]
        public ActionResult CreateClass(ClassModel model)
        {
            if (ModelState.IsValid)
            {
                // check if foreign key(s), unique key(s) are invalid
                if (!IsCreateKeysValid(model))
                {
                    return StatusCode(resp.code, resp);
                }

                Class aClass = new Class
                {
                    Name = model.Name,
                    Year = model.Year,
                    GradeID = model.GradeID,
                    HeadTeacherID = model.HeadTeacherID
                };

                _classService.CreateClass(aClass);

                Console.WriteLine(aClass.Name);
                Console.WriteLine(aClass.Year);
                Console.WriteLine(aClass.Size);
                Console.WriteLine(aClass.GradeID);
                Console.WriteLine(aClass.HeadTeacherID);

                return StatusCode(201, aClass); // 201: Created
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

        private bool IsCreateKeysValid(ClassModel model)
        {
            if (!IsEditKeysValid(model))
            {
                return false;
            }

            // check if Head Teacher exists
            if (model.HeadTeacherID != null)
            {
                // check if Head Teacher is not belong to another class
                if (exist.HeadTeacherExists((int)model.HeadTeacherID))
                {
                    resp.code = 400; //Bad Request
                    resp.messages.Add(new { HeadTeacherID = "Head teacher is belong to another class" });
                    return false;
                }
            }

            // Check for unique index (Name, Year)
            if (exist.ClassExists(model.Name, model.Year))
            {
                resp.code = 400; // bad request
                resp.messages.Add(new { Name = "Already have class " + model.Name + " in " + model.Year });
                return false;
            }

            // all keys are valid
            return true;
        }

        private bool IsEditKeysValid(ClassModel model)
        {
            // Check if Grade ID exists
            if (!exist.GradeExists(model.GradeID))
            {
                resp.code = 404;
                resp.messages.Add(new { GradeID = "Grade not found" });
                return false;
            }

            // check if Head Teacher exists
            if (model.HeadTeacherID != null)
            {
                if (!exist.TeacherExists(model.HeadTeacherID))
                {
                    resp.code = 404;
                    resp.messages.Add(new { HeadTeacherID = "Head teacher not found" });
                    return false;
                }
            }

            // all keys are valid
            return true;
        }


        // should not use delete yet, maybe later
        // DELETE: api/Class/Delete?classId=5
        // [HttpDelete("Delete")]
        [NonAction]
        public ActionResult DeleteClass(int classId)
        {
            var aClass = _classService.GetClass(classId);

            // if no class is found
            if (aClass == null)
            {
                return NotFound();
            }

            _classService.DeleteClass(aClass);

            return Ok(aClass);
        }


        // PUT: aspi/Class/AddStudentsToClass?classId=5
        // JSON: {"studentIds" : [1, 2, 3, 4]} (array of student id)
        [HttpPut("AddStudentsToClass")]
        public ActionResult AddStudentsToClass(int classId, IdListModel model)
        {
            // if class exist
            if (exist.ClassExists(classId))
            {
                if (model.ids == null)
                {
                    return BadRequest();
                }

                foreach (var id in model.ids)
                {
                    Student student = _studentService.GetStudent(id);

                    // check if student exist
                    if (student == null)
                    {
                        resp.code = 404; // Not found
                        resp.messages.Add(new { studentID = "Student ID " + id + " not found" });

                        return NotFound(resp);
                    }
                    else
                    {
                        // bind value(s)
                        student.ClassID = classId;
                    }
                }

                // save changes
                _studentService.Update();

                return Ok();
            }
            // if no class found
            else
            {
                resp.code = 404; // Not found
                resp.messages.Add(new { classID = "Class ID does not exist" });

                return NotFound(resp);
            }
        }
    }
}
