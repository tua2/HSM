namespace ApplicationCore.Entities
{
    public class ResultDetail
    {
        public int ResultDetailID { get; set; }

        public double? Mark { get; set; }

        public int Month { get; set; }

        public int ResultTypeID { get; set; }

        public int ResultID { get; set; }
        public double? MonthlyAverage { get; set; }

        // public virtual Result Result { get; set; }

        public virtual ResultType ResultType { get; set; }
    }
}