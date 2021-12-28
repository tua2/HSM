using System.Linq;
using Microsoft.AspNetCore.Mvc;
using HighSchoolManagerAPI.Services.IServices;

namespace HighSchoolManagerAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize(Roles = "Manager")]
    public class GradeController : ControllerBase
    {
        private readonly IClassService _classService;
        public GradeController(IClassService classService)
        {
            _classService = classService;
        }

        // get grade list
        // GET: api/Grade/Get -> get all
        [HttpGet("Get")]
        public ActionResult GetGrades(int? gradeId, string name)
        {
            // filter by gradeId
            if (gradeId != null)
            {
                var aGrade = _classService.GetGrade((int)gradeId);
                if (aGrade == null)
                {
                    return NotFound();
                }
                return Ok(aGrade);
            }

            var grades = _classService.GetGrades(name);

            grades = grades.OrderBy(g => g.GradeID);
            return Ok(grades);
        }

        //Put Grade
        /*[HttpPut("{id}")]
        public async Task<IActionResult> PutGrade(int gradeId, GradeModel gradeModel)
        {
            var grade = await _context.Grades.FindAsync(gradeId);

            // if no student is found
            if (grade == null)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                grade.Name = gradeModel.Name; //Set new name
                _context.Grades.Update(grade);
                await _context.SaveChangesAsync();

                return Ok(grade);
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
        }*/

        //Delete grade
        /*[HttpDelete("{id}")]
        public async Task<ActionResult<Grade>> DeleteGrade(int id)
        {
            var grade = await _context.Grades.FindAsync(id);
            if (grade == null)
            {
                return NotFound();
            }

            _context.Grades.Remove(grade); // delete from database
            await _context.SaveChangesAsync();

            return Ok(grade);
        }

        // Check if grade exist  
        private bool GradeExists(int id)
        {
            return _context.Grades.Any(e => e.GradeID == id);
        }*/

    }
}