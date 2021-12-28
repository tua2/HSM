using System;

namespace ApplicationCore.Entities
{
    public class Violation
    {
        public int ViolationID { get; set; }
        public string Name { get; set; }
        public DateTime ViolateDate { get; set; }
        public double Score { get; set; }
        public int ViolationRuleID { get; set; }
        public int ConductID { get; set; }
        public virtual ViolationRules ViolationRules { get; set; }
        public virtual Conduct Conduct { get; set; }
    }
}
