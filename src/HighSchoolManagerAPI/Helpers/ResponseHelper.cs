using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;

namespace HighSchoolManagerAPI.Helpers
{
    public class ResponseHelper
    {
        public int code { get; set; }
        public List<object> messages { get; set; }

        public ResponseHelper()
        {
            code = 200; // 200: ok
            messages = new List<object>();
        }
    }
}