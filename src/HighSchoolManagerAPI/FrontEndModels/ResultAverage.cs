using ApplicationCore.Entities;

namespace HighSchoolManagerAPI.FrontEndModels
{
    public class ResultAverage
    {
        public Subject subject { get; set; }
        public double? average { get; set; }
    }
}