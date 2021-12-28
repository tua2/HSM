using System;
using System.Collections.Generic;
using System.Linq;
using ApplicationCore.Entities;
using ApplicationCore.Interfaces;
using HighSchoolManagerAPI.FrontEndModels;
using HighSchoolManagerAPI.Services.IServices;

namespace HighSchoolManagerAPI.Services
{
    public class ReportService : IReportService
    {
        private readonly IUnitOfWork _unitOfWork;
        public ReportService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public List<ReportModel> StudentsRanking(List<ReportModel> reports)
        {
            int rank = 1;
            ReportModel preReport = new ReportModel();
            int size = reports.Count;
            for (int i = 0; i < size; i++)
            {
                if (i == 0)
                {
                    reports[i].rank = rank;
                }
                else
                {
                    // if has equal average with previous report
                    if (reports[i].sumAverage == reports[i - 1].sumAverage)
                    {
                        reports[i].rank = rank;
                    }
                    else
                    {
                        rank = i + 1;
                        reports[i].rank = rank;
                    }
                }
            }

            return reports;
        }

        public List<ReportModel> EvaluatePerformance(List<ReportModel> reports)
        {
            string performance = "";
            foreach (var report in reports)
            {
                if (report.resultAvgs.Count(r => r.average >= 6.5) > 0 && report.sumAverage >= 8)
                {
                    performance = "A";
                }

                if (report.resultAvgs.Count(r => (r.average) >= 5 && (r.average < 6.5)) > 0 && report.sumAverage >= 6.5)
                {
                    performance = "B";
                }

                if (report.resultAvgs.Count(r => (r.average) >= 3.5 && (r.average < 5)) > 0 && report.sumAverage >= 5)
                {
                    performance = "C";
                }

                if (report.resultAvgs.Count(r => (r.average) >= 2 && (r.average < 3.5)) > 0 && report.sumAverage >= 3.5)
                {
                    performance = "D";
                }

                if (report.resultAvgs.Count(r => r.average < 2) > 0)
                {
                    performance = "F";
                }

                if (report.sumAverage == null)
                {
                    performance = null;
                }

                report.performance = performance;
            }

            return reports;
        }

        public PerformanceReportModel PercentagePerformance(PerformanceReportModel performanceReport, List<ReportModel> reports, string performance)
        {
            Percentage percentage = new Percentage();
            double classSize = reports.Count;

            if (classSize == 0)
            {
                percentage.performance = performance;
                percentage.percent = 0;

                performanceReport.classSize = (int)classSize;
                performanceReport.percentages.Add(percentage);

                return performanceReport;
            }

            double performanceCount = 0;

            foreach (var r in reports)
            {
                if (!string.IsNullOrEmpty(r.performance))
                {
                    if (r.performance.Equals(performance))
                    {
                        performanceCount++;
                    }
                }
            }

            percentage.performance = performance;
            percentage.percent = Math.Round(performanceCount / classSize, 2);

            performanceReport.classSize = (int)classSize;
            performanceReport.percentages.Add(percentage);

            return performanceReport;
        }
    }
}