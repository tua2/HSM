using System;
using System.Linq;
using ApplicationCore.Entities;
using Microsoft.AspNetCore.Identity;

namespace Infrastructure.Persistence
{
    public class DataSeed
    {
        public static void Initialize(HighSchoolContext context)
        {
            // Look for any teachers
            if (context.Teachers.Any())
            {
                return;   // DB has been seeded
            }

            // seed teachers
            var teachers = new Teacher[]
            {
                new Teacher
                {
                    Name = "Admin",
                    Birthday = DateTime.Parse("1998-11-30")
                },
            };

            foreach (Teacher t in teachers)
            {
                context.Teachers.Add(t);
            }
            context.SaveChanges();

            // seed roles
            var roles = new IdentityRole[]
            {
                new IdentityRole
                {
                    Name = "Admin",
                    NormalizedName = "ADMIN"
                },
                new IdentityRole
                {
                    Name = "Manager",
                    NormalizedName = "MANAGER"
                },
                new IdentityRole
                {
                    Name = "Teacher",
                    NormalizedName = "TEACHER"
                }
            };

            foreach (IdentityRole role in roles)
            {
                context.Roles.Add(role);
            }
            context.SaveChanges();

            // seed admmin
            var teacher = context.Teachers.Where(t => t.Name.Equals("Admin")).FirstOrDefault();

            var user = new ApplicationUser
            {
                UserName = "admin",
                NormalizedUserName = "ADMIN",
                TeacherID = teacher.TeacherID
            };

            if (!context.Users.Any(u => u.UserName == user.UserName))
            {
                var password = new PasswordHasher<ApplicationUser>();
                var hashed = password.HashPassword(user, "123456");
                user.PasswordHash = hashed;

                context.Users.Add(user);
            }
            context.SaveChanges();

            // set role for user
            var aUser = context.Users.Where(u => u.UserName.Equals("Admin")).FirstOrDefault();
            var aRole = context.Roles.Where(r => r.Name.Equals("Admin")).FirstOrDefault();
            var userRole = new IdentityUserRole<string>
            {
                UserId = aUser.Id,
                RoleId = aRole.Id
            };
            context.UserRoles.Add(userRole);
            context.SaveChanges();

            // seed grades
            var grades = new Grade[]
            {
                new Grade
                {
                    Name = "12"
                },
                new Grade
                {
                    Name = "11"
                },
                new Grade
                {
                    Name = "10"
                }
            };
            foreach (Grade g in grades)
            {
                context.Grades.Add(g);
            }
            context.SaveChanges();

            // seed school years
            var semesters = new Semester[]
            {
                new Semester
                {
                    Label = 2,
                    Year = 2018
                },
                new Semester
                {
                    Label = 1,
                    Year = 2018
                },
            };
            foreach (Semester s in semesters)
            {
                context.Semesters.Add(s);
            }
            context.SaveChanges();

            // seed result types
            var resultTypes = new ResultType[]
            {
                new ResultType
                {
                    Name = "Exam",
                    Coefficient = 3
                },
                new ResultType
                {
                    Name = "45' Test",
                    Coefficient = 2
                },
                new ResultType
                {
                    Name = "15' Test",
                    Coefficient = 1
                },
            };
            foreach (ResultType rT in resultTypes)
            {
                context.ResultTypes.Add(rT);
            }
            context.SaveChanges();

            // seed subjects
            var subjects = new Subject[]
            {
                new Subject { Name = "English" },
                new Subject { Name = "Math" },
                new Subject { Name = "Physics" },
                new Subject { Name = "Chemistry" },
                new Subject { Name = "Biology" },
                new Subject { Name = "History" },
                new Subject { Name = "Geography" },
                new Subject { Name = "Literature" },
                new Subject { Name = "Civic" },
                new Subject { Name = "Information Technology" },
                new Subject { Name = "Physical Education" },
            };
            foreach (Subject s in subjects)
            {
                context.Subjects.Add(s);
            }
            context.SaveChanges();

            // seed students
            var students = new Student[]
            {
                new Student { LastName = "Nguyễn Văn", FirstName = "Aaa", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Trần Văn", FirstName = "Bbb", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguyễn Văn", FirstName = "Ccc", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Trần Văn", FirstName = "Ddd", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguyễn Văn", FirstName = "Eee", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Trần Văn", FirstName = "Fff", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguyễn Văn", FirstName = "Ggg", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Trần Văn", FirstName = "Hhh", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguyễn Văn", FirstName = "Iii", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Trần Văn", FirstName = "Jjj", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguyễn Văn", FirstName = "Kkk", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Trần Văn", FirstName = "Lll", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguyễn Văn", FirstName = "Mmm", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Trần Văn", FirstName = "Nnn", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguyễn Văn", FirstName = "Ooo", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Trần Văn", FirstName = "Ppp", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguyễn Văn", FirstName = "Qqq", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Trần Văn", FirstName = "Rrr", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguyễn Văn", FirstName = "Sss", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Trần Văn", FirstName = "Ttt", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguyễn Văn", FirstName = "Uuu", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Trần Văn", FirstName = "Vvv", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguyễn Văn", FirstName = "Www", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Trần Văn", FirstName = "Xaxa", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguyễn Văn", FirstName = "Yyy", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Trần Văn", FirstName = "Zzz", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguyễn Văn", FirstName = "An", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Trần Văn", FirstName = "Bình", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguyễn Văn", FirstName = "Cường", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Trần Văn", FirstName = "Danh", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguyễn Văn", FirstName = "Em", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Trần Văn", FirstName = "F'ao", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguyễn Văn", FirstName = "Giang", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Trần Văn", FirstName = "Hoàng", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguyễn Văn", FirstName = "Iến", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Trần Văn", FirstName = "Jankos", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguyễn Văn", FirstName = "Khoa", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Trần Văn", FirstName = "Linh", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguyễn Văn", FirstName = "Minh", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Trần Văn", FirstName = "Ngân", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguyễn Văn", FirstName = "Ông", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Trần Văn", FirstName = "Phương", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguyễn Văn", FirstName = "Quân", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Trần Văn", FirstName = "Ram", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguyễn Văn", FirstName = "Sang", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Trần Văn", FirstName = "Trang", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguyễn Văn", FirstName = "Uyên", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Trần Văn", FirstName = "Vân", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguyễn Văn", FirstName = "Wub", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Trần Văn", FirstName = "Xuân", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguyễn Văn", FirstName = "Yến", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Trần Văn", FirstName = "Zap", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguyễn Văn", FirstName = "Một", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Trần Văn", FirstName = "Hai", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguyễn Văn", FirstName = "Ba", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Trần Văn", FirstName = "Bốn", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguyễn Văn", FirstName = "Năm", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Trần Văn", FirstName = "Sáu", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguyễn Văn", FirstName = "Bảy", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Trần Văn", FirstName = "Tám", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguyễn Văn", FirstName = "Chín", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Trần Văn", FirstName = "Mười", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
            };
            foreach (Student s in students)
            {
                context.Students.Add(s);
            }
            context.SaveChanges();
        }
    }
}
