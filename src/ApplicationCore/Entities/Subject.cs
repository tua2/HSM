using ApplicationCore.Interfaces;

namespace ApplicationCore.Entities
{
    public class Subject : IAggregateRoot
    {
        public int SubjectID { get; set; }
        public string Name { get; set; }

        // public virtual List<Result> Results { get; set; }
        // public virtual List<TeachingAssignment> TeachingAssignments { get; set; }

        public Subject() { }

        public Subject(Subject subject)
        {
            SubjectID = subject.SubjectID;
            Name = subject.Name;
        }
    }
}