/**
 * This script checks for student submissions and sends an email
 * when all assigned coursework is turned in.
 * It runs on a time-driven trigger (every 4 hours).
 *
 * IMPORTANT:  Replace the placeholder values with your actual data.
 */
function checkStudentSubmissions() {
  const YOUR_EMAIL = "sclark@nwetc.org"; // **IMPORTANT: Change this to your email address**
  const COURSE_ID = "YNzg1OTAxMTE1MTI1"; // **IMPORTANT: Replace with your Google Classroom Course ID**
  // You can find the Course ID in the URL when you're in your Classroom (e.g., classroom.google.com/c/12345678901)
  // const ASSIGNMENT_ID = "YOUR_ASSIGNMENT_ID"; // **IMPORTANT: Replace with an actual assignment ID if you want to check a specific one**
  // You can get assignment IDs by programmatically listing coursework, or from the URL when editing an assignment.

  try {
    // Get all coursework (assignments) for the specified course
    const coursework = Classroom.Courses.CourseWork.list(COURSE_ID).courseWork;
    if (!coursework || coursework.length === 0) {
      Logger.log('No coursework found for this course.');
      return;
    }

    let completedStudents = [];

    // List all students in the course
    const students = Classroom.Courses.Students.list(COURSE_ID).students;
    if (!students || students.length === 0) {
      Logger.log('No students found in this course.');
      return;
    }

    students.forEach(student => {
      let allAssignmentsCompletedForStudent = true; // Assume true, then prove false

      coursework.forEach(assignment => {
        const submissions = Classroom.Courses.CourseWork.StudentSubmissions.list(
          COURSE_ID,
          assignment.id
        ).studentSubmissions;

        const studentSubmission = submissions ? submissions.find(sub => sub.userId === student.userId) : null;

        if (!studentSubmission || studentSubmission.state !== 'TURNED_IN') {
          // If even one assignment isn't turned in,
          // then this student hasn't completed all assignments
          allAssignmentsCompletedForStudent = false;
        }
      });

      if (allAssignmentsCompletedForStudent) {
        completedStudents.push(student.profile.name.fullName);
      }
    });

    if (completedStudents.length > 0) {
      const subject = "Google Classroom - Students Completed All Assignments";
      const body = `The following students have turned in all assigned coursework:\n\n${completedStudents.join('\n')}`;
      MailApp.sendEmail(YOUR_EMAIL, subject, body);
      Logger.log(`Email sent to ${YOUR_EMAIL} about completed students.`);
    } else {
      Logger.log('No students found to have completed all assignments in this check.');
    }

  } catch (error) {
    Logger.log('Error: ' + error.toString());
    MailApp.sendEmail(
      YOUR_EMAIL,
      "Google Classroom Script Error",
      "An error occurred in your Google Classroom script: " + error.toString()
    );
  }
}

// How to set up and run this script:
// 1. Go to script.google.com
// 2. Click "New project".
// 3. Delete any placeholder code and paste the code above.
// 4. In the Apps Script editor, go to "Services" (left sidebar, plus icon next to "Services").
// 5. Search for and add "Google Classroom API" and "Gmail API". (You'll likely only need Classroom and MailApp).
// 6. **IMPORTANT:** Replace `YOUR_EMAIL` and `YOUR_COURSE_ID` with your actual information.
//    - To find your Course ID: Go to your Google Classroom. The URL will look something like `classroom.google.com/c/12345678901`. The number (e.g., `12345678901`) is your Course ID.
// 7. Save the script (Ctrl + S or File > Save).
// 8. Select the `checkStudentSubmissions` function from the dropdown menu in the toolbar.
// 9. Click the "Run" button (play icon).
// 10. The first time you run it, you will be prompted to authorize the script. Follow the prompts.
// 11. To automate this to run every 4 hours:
//     - In the left sidebar of the Apps Script editor, click on "Triggers" (clock icon).
//     - Click "Add Trigger".
//     - Choose `checkStudentSubmissions` for "Choose which function to run".
//     - Choose "Head" for "Choose which deployment should run".
//     - Select "Time-driven" for "Select event source".
//     - Choose "Hour timer" and then "Every 4 hours".
//     - Click "Save".