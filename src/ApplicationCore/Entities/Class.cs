using ApplicationCore.Interfaces;

namespace ApplicationCore.Entities
{
    public class Class : IAggregateRoot
    {
        public int ClassID { get; set; }

        public string Name { get; set; }

        public int Year { get; set; }

        public int Size { get; set; }

        public int GradeID { get; set; }

        public int? HeadTeacherID { get; set; }


        public virtual Grade Grade { get; set; }
        public virtual Teacher HeadTeacher { get; set; }
        // public virtual List<Student> Students { get; set; }
        // public virtual List<TeachingAssignment> TeachingAssignments { get; set; }

        public Class() { }

        public Class(Class c)
        {
            this.ClassID = c.ClassID;
            this.Name = c.Name;
            this.Year = c.Year;
            this.Size = c.Size;
            this.GradeID = c.GradeID;
            this.HeadTeacherID = c.HeadTeacherID;
            this.Grade = c.Grade;
            this.HeadTeacher = c.HeadTeacher;
        }
    }
}