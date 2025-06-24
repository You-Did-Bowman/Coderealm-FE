import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import universityImage from "../../assets/images/university.png";
import { UserContext } from "../../contexts/userIdContext";

const UniversityIntro = () => {
  const { user, token } = useContext(UserContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [courseExercises, setCourseExercises] = useState([]);
  const [activeCourse, setActiveCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [error, setError] = useState(null);
  const [lessonUnlockStatus, setLessonUnlockStatus] = useState({});
  const [loadingStatus, setLoadingStatus] = useState({});

  // Fetch courses and lessons
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoadingStatus((prev) => ({ ...prev, courses: true }));
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/courses/minimal`
        );
        if (!response.ok) throw new Error("Failed to fetch courses");
        const data = await response.json();
        setCourses(data);

        // Set initial state from navigation or first course
        const navState = location.state || {};
        const initialCourse = navState.activeCourse || data[0]?.id || null;
        setActiveCourse(initialCourse);

        if (navState.activeLesson) {
          setActiveLesson(navState.activeLesson);
        } else if (data[0]?.lessons?.[0]?.id) {
          setActiveLesson(data[0].lessons[0].id);
        }
        setLoadingStatus((prev) => ({ ...prev, courses: false }));
      } catch (err) {
        setError(err.message);
        setLoadingStatus((prev) => ({ ...prev, courses: false }));
      }
    };
    fetchCourses();
  }, [location.state]);

  // Handle navigation state updates
  useEffect(() => {
    if (location.state) {
      if (location.state.activeCourse) {
        setActiveCourse(location.state.activeCourse);
      }
      if (location.state.activeLesson) {
        setActiveLesson(location.state.activeLesson);
      }
    }
  }, [location.state]);

  // Fetch all exercises for the active course
  useEffect(() => {
    if (!activeCourse || !user?.id) return;
   const currentToken = token || localStorage.getItem("token");
    const fetchCourseExercises = async () => {
      const currentToken = token || localStorage.getItem("token");
      try {
        setLoadingStatus((prev) => ({ ...prev, exercises: true }));
        const response = await fetch(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/courses/${activeCourse}/exercises`,
          {
            headers: { Authorization: `Bearer ${currentToken}` },
            credentials: "include",
          }
        );
        if (!response.ok) throw new Error("Failed to fetch course exercises");
        const data = await response.json();
        setCourseExercises(data);
        setLoadingStatus((prev) => ({ ...prev, exercises: false }));
      } catch (err) {
        setError(err.message);
        setLoadingStatus((prev) => ({ ...prev, exercises: false }));
      }
    };
    fetchCourseExercises();
  }, [activeCourse, user?.id]);

  // Calculate lesson unlock status
  useEffect(() => {
    if (!courses.length || !courseExercises.length) return;

    const calculateUnlockStatus = () => {
      const status = {};

      // For each course
      courses.forEach((course) => {
        // First lesson is always unlocked
        if (course.lessons.length > 0) {
          status[course.lessons[0].id] = true;
        }

        // Subsequent lessons depend on previous completion
        for (let i = 1; i < course.lessons.length; i++) {
          const prevLessonId = course.lessons[i - 1].id;
          const prevLessonExercises = courseExercises.filter(
            (ex) => ex.lesson_id === prevLessonId
          );

          // Lesson is unlocked if all exercises in previous lesson are completed
          status[course.lessons[i].id] =
            prevLessonExercises.length > 0 &&
            prevLessonExercises.every((ex) => ex.completed);
        }
      });

      return status;
    };

    setLessonUnlockStatus(calculateUnlockStatus());
  }, [courses, courseExercises]);

  // Handle course change
  const handleCourseChange = (courseId) => {
    setActiveCourse(courseId);
    const course = courses.find((c) => c.id === courseId);
    if (course?.lessons?.[0]?.id) {
      setActiveLesson(course.lessons[0].id);
    }
  };

  // Get lesson title from course data
  const getLessonTitle = (lessonId) => {
    if (!activeCourse) return "";
    const course = courses.find((c) => c.id === activeCourse);
    if (!course) return "";
    const lesson = course.lessons.find((l) => l.id === lessonId);
    return lesson ? lesson.title : "";
  };

  // Calculate progress for a lesson
  const calculateLessonProgress = (lessonId) => {
    const lessonExercises = courseExercises.filter(
      (ex) => ex.lesson_id === parseInt(lessonId)
    );
    const completed = lessonExercises.filter((ex) => ex.completed).length;
    return {
      completed,
      total: lessonExercises.length,
      allDone: completed === lessonExercises.length,
    };
  };

  if (error) {
    return <div className="text-red-500 text-center p-8">Error: {error}</div>;
  }

  if (loadingStatus.courses) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-poppins bg-background text-white">
      {/* Header */}
      <div
        className="relative w-full h-[200px] sm:h-[300px] md:h-[400px] lg:h-[500px] mx-auto mb-6 md:mb-8 overflow-hidden"
        style={{
          boxShadow: "inset 0px -250px 250px 30px #0E0E1A",
          backgroundImage: `url(${universityImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-accent font-bold text-center tracking-wide">
            UNIVERSITY OF
            <br />
            TERMINALIA
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6 p-4">
        {/* Left sidebar - Courses */}
        <div className="w-full lg:w-[280px] border-2 border-accent rounded-lg p-3 md:p-4 bg-gray-900/50">
          <h2 className="text-xl mb-4">Courses</h2>
          {courses.map((course) => (
            <div key={course.id} className="mb-4">
              <div
                className={`flex justify-between items-center p-2 cursor-pointer rounded-md ${
                  activeCourse === course.id
                    ? "bg-primary text-background"
                    : "hover:bg-gray-700/50"
                }`}
                onClick={() => handleCourseChange(course.id)}
              >
                <h3 className="text-lg md:text-xl">{course.title}</h3>
                <svg
                  className={`w-4 h-4 md:w-5 md:h-5 transform transition-transform ${
                    activeCourse === course.id ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>

              {/* Lessons dropdown */}
              {activeCourse === course.id && course.lessons && (
                <ul className="ml-4 mt-2 space-y-1 border-l-2 border-accent pl-3">
                  {course.lessons.map((lesson) => (
                    <li
                      key={lesson.id}
                      className={`p-2 text-sm rounded-md flex items-center ${
                        activeLesson === lesson.id
                          ? "bg-secondary/20 text-accent font-medium"
                          : lessonUnlockStatus[lesson.id]
                          ? "hover:bg-gray-700/30 cursor-pointer"
                          : "opacity-50 cursor-not-allowed"
                      }`}
                      onClick={() => {
                        if (lessonUnlockStatus[lesson.id]) {
                          setActiveLesson(lesson.id);
                        }
                      }}
                    >
                      {lesson.title}
                      {!lessonUnlockStatus[lesson.id] && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 ml-2 text-yellow-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Right content area */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Lesson Header */}
          {activeLesson && (
            <div className="border-2 border-accent rounded-lg p-4 md:p-6 bg-gray-900/50">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl md:text-3xl text-accent">
                  {getLessonTitle(activeLesson)}
                </h2>
                {activeLesson && (
                  <div className="text-sm text-gray-400">
                    {calculateLessonProgress(activeLesson).completed}/
                    {calculateLessonProgress(activeLesson).total} completed
                    {calculateLessonProgress(activeLesson).allDone && (
                      <span className="ml-2 text-green-500">✓</span>
                    )}
                  </div>
                )}
              </div>
              {/* <p className="text-gray-300 mb-6">
                {!lessonUnlockStatus[activeLesson] ? (
                  <span className="text-yellow-500 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Complete previous lesson to unlock this content
                  </span>
                ) : (
                  "This lesson covers fundamental concepts and techniques."
                )}
              </p> */}
            </div>
          )}

          {/* Exercises Table */}
          <div className="border-2 border-accent rounded-lg p-4 md:p-6 bg-gray-900/50">
            <h3 className="text-xl md:text-2xl mb-4">Exercises</h3>

            {activeLesson ? (
              loadingStatus.exercises ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="border-b border-accent">
                        <th className="py-2 px-4 text-left">Exercise</th>
                        <th className="py-2 px-4 text-left">Title</th>
                        <th className="py-2 px-4 text-left">XP</th>
                        <th className="py-2 px-4 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courseExercises
                        .filter((ex) => ex.lesson_id === parseInt(activeLesson))
                        .map((exercise, index) => {
                          // Exercise is unlocked if:
                          // 1. It's the first exercise in the lesson, OR
                          // 2. All previous exercises in the lesson are completed
                          const isUnlocked =
                            index === 0 ||
                            courseExercises
                              .filter(
                                (ex) => ex.lesson_id === parseInt(activeLesson)
                              )
                              .slice(0, index)
                              .every((ex) => ex.completed);

                          return (
                            <tr
                              key={exercise.id}
                              className={`border-b border-gray-700 ${
                                isUnlocked && lessonUnlockStatus[activeLesson]
                                  ? "hover:bg-gray-800/50 cursor-pointer"
                                  : "opacity-50"
                              }`}
                              onClick={() => {
                                if (
                                  isUnlocked &&
                                  lessonUnlockStatus[activeLesson]
                                ) {
                                  navigate(`/university/${exercise.id}`, {
                                    state: {
                                      activeCourse,
                                      activeLesson,
                                    },
                                  });
                                }
                              }}
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center">
                                  <span className="mr-2">
                                    Exercise {index + 1}
                                  </span>
                                  {!isUnlocked && index > 0 && (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4 text-yellow-500"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4">{exercise.title}</td>
                              <td className="py-3 px-4 text-accent">
                                +{exercise.xp_reward} XP
                              </td>
                              <td className="py-3 px-4">
                                {exercise.completed ? (
                                  <span className="text-green-500 flex items-center">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4 mr-1"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    Completed
                                  </span>
                                ) : (
                                  <>
                                    {lessonUnlockStatus[activeLesson] &&
                                    isUnlocked ? (
                                      <button
                                        className="bg-secondary text-black px-3 py-1 rounded hover:bg-secondaryHover transition-colors"
                                        onClick={() => {
                                          navigate(
                                            `/university/${exercise.id}`,
                                            {
                                              state: {
                                                activeCourse,
                                                activeLesson,
                                              },
                                            }
                                          );
                                        }}
                                      >
                                        Start
                                      </button>
                                    ) : (
                                      <span
                                        className={
                                          isUnlocked &&
                                          lessonUnlockStatus[activeLesson]
                                            ? "text-secondary"
                                            : "text-gray-500"
                                        }
                                      >
                                        {!lessonUnlockStatus[activeLesson]
                                          ? "Lesson Locked"
                                          : !isUnlocked
                                          ? "Complete previous"
                                          : "Start"}
                                      </span>
                                    )}
                                  </>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              <p className="text-gray-400 italic">
                Select a lesson to view its exercises
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversityIntro;
