using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ApplicationCore.Entities;

namespace Infrastructure.Persistence
{
    // public class HighSchoolContext : ApiAuthorizationDbContext<Account>
    public class HighSchoolContext : IdentityDbContext<ApplicationUser>

    {
        // public HighSchoolContext(DbContextOptions<HighSchoolContext> options, IOptions<OperationalStoreOptions> operationalStoreOptions) : base(options, operationalStoreOptions)
        public HighSchoolContext(DbContextOptions<HighSchoolContext> options) : base(options)
        {
        }

        public virtual DbSet<Class> Classes { get; set; }
        public virtual DbSet<Conduct> Conducts { get; set; }
        public virtual DbSet<Grade> Grades { get; set; }
        public virtual DbSet<Result> Results { get; set; }
        public virtual DbSet<ResultDetail> ResultDetails { get; set; }
        public virtual DbSet<ResultType> ResultTypes { get; set; }
        public virtual DbSet<Semester> Semesters { get; set; }
        public virtual DbSet<Student> Students { get; set; }
        public virtual DbSet<Subject> Subjects { get; set; }
        public virtual DbSet<Teacher> Teachers { get; set; }
        public virtual DbSet<TeachingAssignment> TeachingAssignments { get; set; }
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            // optionsBuilder.UseSqlServer(@"Server=127.0.0.1;Database=HighSchoolDb;User ID=sa;Password=HoangLuuMinh123");
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // class name + year must be unique
            modelBuilder.Entity<Class>()
                    .HasIndex(c => new { c.Name, c.Year })
                    .IsUnique();
        }
    }
}