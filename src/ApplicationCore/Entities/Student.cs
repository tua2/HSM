using System;
using ApplicationCore.Interfaces;

namespace ApplicationCore.Entities
{
    public class Student : IAggregateRoot
    {
        public int StudentID { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string Gender { get; set; }

        public DateTime Birthday { get; set; }

        public string Address { get; set; }

        public DateTime EnrollDate { get; set; }

        public int? ClassID { get; set; }

        public virtual Class Class { get; set; }
        // public virtual List<Conduct> Conducts { get; set; }
        // public virtual List<Result> Results { get; set; }

        public Student()
        {
            EnrollDate = DateTime.Today;
        }

        public Student(Student student)
        {
            StudentID = student.StudentID;
            FirstName = student.FirstName;
            LastName = student.LastName;
            Gender = student.Gender;
            Birthday = student.Birthday;
            Address = student.Address;
            ClassID = student.ClassID;
            Class = student.Class;
            EnrollDate = DateTime.Today;
        }
    }
}
