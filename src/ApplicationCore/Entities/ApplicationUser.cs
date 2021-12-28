using Microsoft.AspNetCore.Identity;
using ApplicationCore.Interfaces;

namespace ApplicationCore.Entities
{
    public class ApplicationUser : IdentityUser, IAggregateRoot
    {
        public int TeacherID { get; set; }

        public Teacher Teacher { get; set; }
    }
}