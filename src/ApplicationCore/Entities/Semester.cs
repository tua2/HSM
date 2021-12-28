using ApplicationCore.Interfaces;

namespace ApplicationCore.Entities
{
    public class Semester : IAggregateRoot
    {
        public int SemesterID { get; set; }

        public int Label { get; set; }

        public int Year { get; set; }

        // public virtual List<Conduct> Conducts { get; set; }
        // public virtual List<Result> Results { get; set; }
    }
}