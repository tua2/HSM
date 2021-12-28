using System;

namespace ApplicationCore.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        /* Aggregates */
        IAccountRepository Account { get; }
        IClassRepository Class { get; }
        IResultRepository Result { get; }
        //IConductRepository Conduct { get; }

        /* Standalone Aggregates */
        ITeacherRepository Teacher { get; }
        ITeachingAssignmentRepository TeachingAssignment { get; }
        ISubjectRepository Subject { get; }
        IStudentRepository Student { get; }
        ISemesterRepository Semester { get; }

        int Complete();
    }
}