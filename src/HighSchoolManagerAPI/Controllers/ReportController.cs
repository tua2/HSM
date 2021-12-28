using System.Collections.Generic;
using System.Linq;
using ApplicationCore.Entities;
using HighSchoolManagerAPI.FrontEndModels;
using HighSchoolManagerAPI.Helpers;
using HighSchoolManagerAPI.Services.IServices;
using Microsoft.AspNetCore.Mvc;

namespace HighSchoolManagerAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        private readonly IResultService _resultService;
        private readonly IStudentService _studentService;
        private readonly IClassService _classService;
        private readonly ISubjectService _subjectService;
        private readonly ISemesterService _semesterService;
        private readonly IReportService _reportService;
        private readonly ResponseHelper resp;

        public ReportController(IResultService resultService, IStudentService studentService, IClassService classService, ISubjectService subjectService, ISemesterService semesterService, IReportService reportService, IExistHelper exist)
        {
            _resultService = resultService;
            _studentService = studentService;
            _classService = classService;
            _subjectService = subjectService;
            _semesterService = semesterService;
            _reportService = reportService;
            resp = new ResponseHelper();
        }

        [HttpGet("MonthlyReport")]
        public ActionResult MonthlyReport(int? classId, int? gradeId, int year, int month)
        {
            // object to return
            List<ReportModel> monthlyReports = new List<ReportModel>();

            if (classId != null || gradeId != null)
            {
                List<Subject> subjects = _subjectService.GetSubjects(null, null).ToList();
                int numOfSubject = subjects.Count;
                List<Student> students;

                if (classId != null)
                {
                    // get students by classid
                    students = _studentService.GetStudents(null, null, classId, null, null).ToList();
                }
                else
                {
                    // get students by gradeid
                    students = _studentService.GetStudents(null, gradeId, null, null, null).ToList();
                }

                // if no student found
                if (students.Count == 0)
                {
                    return Ok(monthlyReports);
                }

                monthlyReports = RenderMonthlyReport(monthlyReports, students, subjects, year, month, numOfSubject);

                return Ok(monthlyReports);
            }

            return Ok(monthlyReports);
        }

        [HttpGet("SemesterReport")]
        public ActionResult SemesterReport(int? classId, int? gradeId, int semesterId)
        {
            // object to return
            List<ReportModel> semesterReports = new List<ReportModel>();

            if (classId != null || gradeId != null)
            {
                List<Subject> subjects = _subjectService.GetSubjects(null, null).ToList();
                int numOfSubject = subjects.Count;
                List<Student> students;

                if (classId != null)
                {
                    // get students by classid
                    students = _studentService.GetStudents(null, null, classId, null, null).ToList();
                }
                else
                {
                    // get students by gradeid
                    students = _studentService.GetStudents(null, gradeId, null, null, null).ToList();
                }

                // if no student found
                if (students.Count == 0)
                {
                    return Ok(semesterReports);
                }

                semesterReports = RenderSemesterReport(semesterReports, students, subjects, semesterId, numOfSubject);

                return Ok(semesterReports);
            }

            return Ok(semesterReports);
        }

        [HttpGet("PerformanceReport")]
        public ActionResult PerformanceReport(int semesterId)
        {
            Semester semester = _semesterService.GetSemester(semesterId);
            List<PerformanceReportModel> performanceReports = new List<PerformanceReportModel>();

            if (semester == null)
            {
                // return empty list
                return Ok(performanceReports);
            }

            List<Class> classes = _classService.GetClasses(null, null, semester.Year, null, null, null).ToList();
            // List<Student> students = _studentService.GetStudents(null, null, null, semester.Year, null).ToList();

            // if no student found
            if (classes.Count == 0)
            {
                return Ok(performanceReports);
            }

            List<Student> students = new List<Student>();
            List<ReportModel> semesterReports = new List<ReportModel>();
            List<Subject> subjects = _subjectService.GetSubjects(null, null).ToList();
            PerformanceReportModel performanceReport = new PerformanceReportModel();
            int numOfSubject = subjects.Count;



            foreach (var aClass in classes)
            {
                performanceReport = new PerformanceReportModel();
                performanceReport.aClass = aClass;
                semesterReports = new List<ReportModel>();

                students = _studentService.GetStudents(null, null, aClass.ClassID, null, null).ToList();
                if (students.Count != 0)
                {
                    semesterReports = RenderSemesterReport(semesterReports, students, subjects, semesterId, numOfSubject);
                }

                performanceReport = _reportService.PercentagePerformance(performanceReport, semesterReports, "A");
                performanceReport = _reportService.PercentagePerformance(performanceReport, semesterReports, "B");
                performanceReport = _reportService.PercentagePerformance(performanceReport, semesterReports, "C");
                performanceReport = _reportService.PercentagePerformance(performanceReport, semesterReports, "D");
                performanceReport = _reportService.PercentagePerformance(performanceReport, semesterReports, "F");

                performanceReports.Add(performanceReport);
            }

            return Ok(performanceReports);
        }

        [NonAction]
        public List<ReportModel> RenderMonthlyReport(List<ReportModel> monthlyReports, List<Student> students, List<Subject> subjects, int year, int month, int numOfSubject)
        {
            Semester semester = new Semester();
            Result result = new Result();

            // calculate average for each student
            foreach (var student in students)
            {
                ReportModel monthlyReport = new ReportModel();

                monthlyReport.student = new Student(student);
                double? average = null;

                // get semesterId by month
                switch (month)
                {
                    case 9:
                    case 10:
                    case 11:
                    case 12:
                        semester = _semesterService.GetSemesters(1, year).FirstOrDefault();
                        break;
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                        semester = _semesterService.GetSemesters(2, year).FirstOrDefault();
                        break;
                    default:
                        break;
                }

                // calculate each subject average
                foreach (var subject in subjects)
                {
                    // get result, filter detail by month
                    result = _resultService.GetResult(student.StudentID, subject.SubjectID, semester.SemesterID, month);

                    if (result == null)
                    {
                        average = null;
                    }
                    else
                    {
                        // get monthly average
                        if (result.ResultDetails.Count() == 0)
                        {
                            average = null;
                        }
                        else
                        {
                            average = result.ResultDetails.ToList()[0].MonthlyAverage;
                        }
                    }

                    ResultAverage resultAverage = new ResultAverage()
                    {
                        subject = new Subject(subject),
                        average = average
                    };

                    monthlyReport.resultAvgs.Add(resultAverage);
                }

                monthlyReport.sumAverage = _resultService.CalculateStudentAverage(monthlyReport.resultAvgs, numOfSubject);

                monthlyReports.Add(monthlyReport);
            }

            // sort by sumAverage
            monthlyReports = monthlyReports.OrderByDescending(m => m.sumAverage).ToList();

            // ranking
            monthlyReports = _reportService.StudentsRanking(monthlyReports);

            // performance
            monthlyReports = _reportService.EvaluatePerformance(monthlyReports);

            return monthlyReports;
        }

        [NonAction]
        public List<ReportModel> RenderSemesterReport(List<ReportModel> semesterReports, List<Student> students, List<Subject> subjects, int semesterId, int numOfSubject)
        {
            Result result = new Result();

            // calculate average for each student
            foreach (var student in students)
            {
                ReportModel semesterReport = new ReportModel();

                semesterReport.student = new Student(student);
                double? average = null;

                // calculate each subject average
                foreach (var subject in subjects)
                {
                    // get result, filter detail by month
                    result = _resultService.GetResults(student.StudentID, semesterId, subject.SubjectID, null).FirstOrDefault();

                    if (result == null)
                    {
                        average = null;
                    }
                    else
                    {
                        // get monthly average
                        average = result.Average;
                    }

                    ResultAverage resultAverage = new ResultAverage()
                    {
                        subject = new Subject(subject),
                        average = average
                    };

                    semesterReport.resultAvgs.Add(resultAverage);
                }

                semesterReport.sumAverage = _resultService.CalculateStudentAverage(semesterReport.resultAvgs, numOfSubject);

                semesterReports.Add(semesterReport);
            }

            // sort by sumAverage
            semesterReports = semesterReports.OrderByDescending(m => m.sumAverage).ToList();

            // ranking
            semesterReports = _reportService.StudentsRanking(semesterReports);

            // performance
            semesterReports = _reportService.EvaluatePerformance(semesterReports);

            return semesterReports;
        }
    }
}
