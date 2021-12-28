using ApplicationCore.Interfaces;

namespace ApplicationCore.Entities
{
    public class Conduct : IAggregateRoot
    {
        public int ConductID { get; set; }

        public int StundentID { get; set; }

        public int SemesterID { get; set; }

        public virtual Semester Semester { get; set; }

        public virtual Student Student { get; set; }
    }
}