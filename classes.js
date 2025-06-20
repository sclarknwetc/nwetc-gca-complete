function listCourses() {
  try {
    const courses = Classroom.Courses.list().courses;
    if (courses && courses.length > 0) {
      Logger.log('Courses:');
      courses.forEach(course => Logger.log(`${course.name} (${course.id})`));
    } else {
      Logger.log('No courses found.');
    }
  } catch (error) {
    Logger.log('Error: ' + error.toString());
  }
}