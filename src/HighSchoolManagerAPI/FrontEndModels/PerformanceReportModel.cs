using System.Collections.Generic;
using ApplicationCore.Entities;

namespace HighSchoolManagerAPI.FrontEndModels
{
    public class PerformanceReportModel
    {
        public Class aClass { get; set; }
        public int classSize { get; set; }
        public List<Percentage> percentages { get; set; }

        public PerformanceReportModel()
        {
            percentages = new List<Percentage>();
        }
    }
}