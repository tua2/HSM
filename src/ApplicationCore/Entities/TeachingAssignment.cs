using ApplicationCore.Interfaces;

namespace ApplicationCore.Entities
{
    public class TeachingAssignment : IAggregateRoot
    {
        public TeachingAssignment() { }
        public TeachingAssignment(TeachingAssignment assignment)
        {
            this.TeachingAssignmentID = assignment.TeachingAssignmentID;
            this.TeacherID = assignment.TeacherID;
            this.ClassID = assignment.ClassID;
            this.SubjectID = assignment.SubjectID;
        }

        public int TeachingAssignmentID { get; set; }

        public int TeacherID { get; set; }

        public int ClassID { get; set; }

        public int SubjectID { get; set; }

        public virtual Class Class { get; set; }

        public virtual Subject Subject { get; set; }

        public virtual Teacher Teacher { get; set; }
    }
}