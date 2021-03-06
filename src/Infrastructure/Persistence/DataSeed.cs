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
                new Student { LastName = "Nguy???n V??n", FirstName = "Aaa", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Tr???n V??n", FirstName = "Bbb", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguy???n V??n", FirstName = "Ccc", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Tr???n V??n", FirstName = "Ddd", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguy???n V??n", FirstName = "Eee", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Tr???n V??n", FirstName = "Fff", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguy???n V??n", FirstName = "Ggg", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Tr???n V??n", FirstName = "Hhh", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguy???n V??n", FirstName = "Iii", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Tr???n V??n", FirstName = "Jjj", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguy???n V??n", FirstName = "Kkk", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Tr???n V??n", FirstName = "Lll", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguy???n V??n", FirstName = "Mmm", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Tr???n V??n", FirstName = "Nnn", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguy???n V??n", FirstName = "Ooo", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Tr???n V??n", FirstName = "Ppp", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguy???n V??n", FirstName = "Qqq", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Tr???n V??n", FirstName = "Rrr", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguy???n V??n", FirstName = "Sss", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Tr???n V??n", FirstName = "Ttt", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguy???n V??n", FirstName = "Uuu", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Tr???n V??n", FirstName = "Vvv", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguy???n V??n", FirstName = "Www", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Tr???n V??n", FirstName = "Xaxa", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguy???n V??n", FirstName = "Yyy", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Tr???n V??n", FirstName = "Zzz", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguy???n V??n", FirstName = "An", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Tr???n V??n", FirstName = "B??nh", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguy???n V??n", FirstName = "C?????ng", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Tr???n V??n", FirstName = "Danh", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguy???n V??n", FirstName = "Em", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Tr???n V??n", FirstName = "F'ao", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguy???n V??n", FirstName = "Giang", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Tr???n V??n", FirstName = "Ho??ng", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguy???n V??n", FirstName = "I???n", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Tr???n V??n", FirstName = "Jankos", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguy???n V??n", FirstName = "Khoa", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Tr???n V??n", FirstName = "Linh", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguy???n V??n", FirstName = "Minh", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Tr???n V??n", FirstName = "Ng??n", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguy???n V??n", FirstName = "??ng", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Tr???n V??n", FirstName = "Ph????ng", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguy???n V??n", FirstName = "Qu??n", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Tr???n V??n", FirstName = "Ram", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguy???n V??n", FirstName = "Sang", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Tr???n V??n", FirstName = "Trang", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguy???n V??n", FirstName = "Uy??n", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Tr???n V??n", FirstName = "V??n", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguy???n V??n", FirstName = "Wub", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Tr???n V??n", FirstName = "Xu??n", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguy???n V??n", FirstName = "Y???n", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Tr???n V??n", FirstName = "Zap", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguy???n V??n", FirstName = "M???t", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Tr???n V??n", FirstName = "Hai", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguy???n V??n", FirstName = "Ba", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Tr???n V??n", FirstName = "B???n", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguy???n V??n", FirstName = "N??m", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Tr???n V??n", FirstName = "S??u", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguy???n V??n", FirstName = "B???y", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Tr???n V??n", FirstName = "T??m", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Nguy???n V??n", FirstName = "Ch??n", Gender = "Male", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
                new Student { LastName = "Tr???n V??n", FirstName = "M?????i", Gender = "Female", Birthday = DateTime.Parse("2005-01-01"), Address = "123 Everywhere" },
            };
            foreach (Student s in students)
            {
                context.Students.Add(s);
            }
            context.SaveChanges();
        }
    }
}
