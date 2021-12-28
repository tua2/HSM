/* NOT USE YET, BUT LATER... MAYBE, WHO KNOW =)) */

// using System;
// using Microsoft.Data.SqlClient;
// using Microsoft.EntityFrameworkCore;

// namespace HighSchoolManagerAPI.Helpers
// {
//     public class ExceptionHelper
//     {
//         public static string HandleDbUpdateException(DbUpdateException exception)
//         {
//             var sqlException = exception.GetBaseException() as SqlException;
//             if (sqlException != null)
//             {
//                 if (sqlException.Errors.Count > 0)
//                 {
//                     var message = "";
//                     switch (sqlException.Errors[0].Number)
//                     {
//                         case 547: // Foreign Key violation
//                             message = "Country code could not be deleted, because it is in use";
//                             break;
//                         case 2627:
//                             message = "Unique constraint error";
//                             break;
//                         case 2601:
//                             message = "Duplicate key";
//                             break;
//                         default:
//                             break;
//                     }
//                     return message;
//                 }
//             }
//             else
//             {

//             }
//             return "";
//         }
//     }
// }