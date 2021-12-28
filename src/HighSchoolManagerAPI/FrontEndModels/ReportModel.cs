using System.Collections.Generic;
using ApplicationCore.Entities;

namespace HighSchoolManagerAPI.FrontEndModels
{
    public class ReportModel
    {
        public int rank { get; set; }
        public Student student { get; set; }
        public List<ResultAverage> resultAvgs { get; set; }
        public double? sumAverage { get; set; }
        public string performance { get; set; }

        public ReportModel()
        {
            resultAvgs = new List<ResultAverage>();
        }
    }
}