import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import universityImage from "../../assets/images/university.png";
import { UserContext } from "../../contexts/userIdContext";
import "./_universityIntro.scss";

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
      <div className="flex items-center justify-center h-screen bg-[#011414]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2cc295]"></div>
      </div>
    );
  }

  return (
    <div className="university-intro min-h-screen">
      {/* Header */}
      <div
        className="header-container relative w-full h-[200px] sm:h-[300px] md:h-[400px] lg:h-[500px] mx-auto mb-6 md:mb-8 overflow-hidden"
        style={{
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center tracking-wide">
            UNIVERSITY OF
            <br />
            TERMINALIA
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6 p-4">
        {/* Left sidebar - Courses */}
        <div className="sidebar w-full lg:w-[280px] rounded-lg p-3 md:p-4">
          <h2 className="text-xl mb-4 text-[#2cc295]">Courses</h2>
          {courses.map((course) => (
            <div key={course.id} className="mb-4">
              <div
                className={`course-header flex justify-between items-center p-2 cursor-pointer rounded-md ${
                  activeCourse === course.id ? "active-course" : ""
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
                <ul className="ml-4 mt-2 space-y-1 pl-3">
                  {course.lessons.map((lesson) => (
                    <li
                      key={lesson.id}
                      className={`lesson-item p-2 text-sm rounded-md flex items-center ${
                        activeLesson === lesson.id ? "active-lesson" : ""
                      } ${
                        lessonUnlockStatus[lesson.id] ? "unlocked" : "locked"
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
                          className="h-4 w-4 ml-2 text-[#707d7d]"
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
            <div className="content-panel rounded-lg p-4 md:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl md:text-3xl text-[#2cc295]">
                  {getLessonTitle(activeLesson)}
                </h2>
                {activeLesson && (
                  <div className="progress-text text-sm">
                    {calculateLessonProgress(activeLesson).completed}/
                    {calculateLessonProgress(activeLesson).total} completed
                    {calculateLessonProgress(activeLesson).allDone && (
                      <span className="ml-2 completed-badge">✓</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Exercises Table */}
          <div className="content-panel rounded-lg p-4 md:p-6">
            <h3 className="text-xl md:text-2xl mb-4 text-[#2cc295]">Exercises</h3>

            {activeLesson ? (
              loadingStatus.exercises ? (
                <div className="flex justify-center py-8">
                  <div className="spinner animate-spin rounded-full h-8 w-8 border-t-2 border-b-2"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="exercise-table min-w-full border-collapse">
                    <thead>
                      <tr>
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
                              className={`${
                                isUnlocked && lessonUnlockStatus[activeLesson]
                                  ? "cursor-pointer"
                                  : "opacity-70"
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
                                      className="h-4 w-4 text-[#707d7d]"
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
                              <td className="py-3 px-4 text-[#2cc295]">
                                +{exercise.xp_reward} XP
                              </td>
                              <td className="py-3 px-4">
                                {exercise.completed ? (
                                  <span className="completed-badge flex items-center">
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
                                        className="start-button"
                                        onClick={(e) => {
                                          e.stopPropagation();
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
                                      <span className="locked-text">
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
              <p className="text-[#aacbc4] italic">
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