using System;
using ApplicationCore.Interfaces;

namespace ApplicationCore.Entities
{
    public class Teacher : IAggregateRoot
    {
        public int TeacherID { get; set; }

        public string Name { get; set; }

        public string Gender { get; set; }

        public DateTime Birthday { get; set; }

        // public virtual List<Class> Classes { get; set; }

        // public virtual List<TeachingAssignment> TeachingAssignments { get; set; }
    }
}

