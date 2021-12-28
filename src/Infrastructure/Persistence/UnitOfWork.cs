using ApplicationCore.Entities;
using ApplicationCore.Interfaces;
using Infrastructure.Persistence.Repositories;
using Microsoft.AspNetCore.Identity;

namespace Infrastructure.Persistence
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly HighSchoolContext _context;

        public UnitOfWork(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager, RoleManager<IdentityRole> roleManager, HighSchoolContext context)
        {
            /* Aggregates */
            Account = new AccountRepository(userManager, signInManager, roleManager);
            Class = new ClassRepository(context);
            Result = new ResultRepository(context);
            //Conduct = new ConductRepository(context);

            /* Standalone Aggregates */
            Teacher = new TeacherRepository(context);
            TeachingAssignment = new TeachingAssignmentRepository(context);
            Subject = new SubjectRepository(context);
            Student = new StudentRepository(context);
            Semester = new SemesterRepository(context);

            _context = context;
        }

        /* Aggregates */
        public IAccountRepository Account { get; private set; }
        public IClassRepository Class { get; private set; }
        public IResultRepository Result { get; private set; }
        //public IConductRepository Conduct { get; private set; }

        /* Standalone Aggregates */
        public ITeacherRepository Teacher { get; private set; }
        public ITeachingAssignmentRepository TeachingAssignment { get; private set; }
        public ISubjectRepository Subject { get; private set; }
        public IStudentRepository Student { get; private set; }
        public ISemesterRepository Semester { get; private set; }

        public int Complete()
        {
            return _context.SaveChanges();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
