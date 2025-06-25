import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
      <div className="header-container relative w-full h-[250px] sm:h-[300px] md:h-[350px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-center tracking-wide text-white floating-animation">
            UNIVERSITY OF
            <br />
            <span className="highlight-text">TERMINALIA</span>
          </h1>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1f1f] via-[#002d28] to-[#0a1f1f] opacity-95"></div>
        <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-[#011414] to-transparent"></div>

        {/* Animated floating elements */}
        <div className="absolute top-1/4 left-1/4 w-6 h-6 rounded-full bg-[#2cc295] opacity-20 floating-element-1"></div>
        <div className="absolute top-1/3 right-1/4 w-8 h-8 rounded-full bg-[#FCA5A5] opacity-15 floating-element-2"></div>
        <div className="absolute bottom-1/4 left-1/2 w-10 h-10 rounded-full bg-[#2cc295] opacity-10 floating-element-3"></div>
      </div>
      {/* Corruption Line */}
      <div className="corruption-line w-full h-1"></div>
      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6 p-4 max-w-7xl mx-auto">
        {/* Left sidebar - Courses */}
        <div className="sidebar w-full lg:w-[300px] rounded-xl p-4 backdrop-blur-sm">
          <h2 className="text-xl mb-4 text-white font-semibold border-b border-[#FCA5A550] pb-2">
            Courses
          </h2>
          {courses.map((course) => (
            <div key={course.id} className="mb-4">
              <div
                className={`course-header flex justify-between items-center p-3 cursor-pointer rounded-lg transition-all duration-300 ${
                  activeCourse === course.id
                    ? "bg-gradient-to-r from-[#2cc295] to-[#1e8c72] text-[#011414]"
                    : "bg-[#0a1f1f] hover:bg-[#0f2a2a] text-white"
                }`}
                onClick={() => handleCourseChange(course.id)}
              >
                <h3 className="text-base md:text-lg font-medium">
                  {course.title}
                </h3>
                <svg
                  className={`w-5 h-5 transform transition-transform ${
                    activeCourse === course.id
                      ? "rotate-180 text-[#011414]"
                      : "text-[#2cc295]"
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
                <ul className="ml-2 mt-3 space-y-2 pl-2 border-l border-[#FCA5A530]">
                  {course.lessons.map((lesson) => (
                    <li
                      key={lesson.id}
                      className={`lesson-item p-2 text-sm rounded-md transition-all ${
                        activeLesson === lesson.id
                          ? "text-[#2cc295] font-medium bg-[#2cc29510]"
                          : "text-white"
                      } ${
                        lessonUnlockStatus[lesson.id]
                          ? "cursor-pointer hover:bg-[#2cc29515] pl-3"
                          : "opacity-60 cursor-not-allowed"
                      }`}
                      onClick={() => {
                        if (lessonUnlockStatus[lesson.id]) {
                          setActiveLesson(lesson.id);
                        }
                      }}
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-2 h-2 rounded-full mr-3 ${
                            activeLesson === lesson.id
                              ? "bg-[#FCA5A5]"
                              : "bg-white"
                          }`}
                        ></div>
                        {lesson.title}
                        {!lessonUnlockStatus[lesson.id] && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 ml-2 text-[#FCA5A5]"
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
            <div className="content-panel rounded-xl p-5 bg-gradient-to-br from-[#0a1f1f] to-[#011414] border border-[#FCA5A530] backdrop-blur-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
                <h2 className="text-2xl md:text-3xl text-white font-bold tracking-tight">
                  {getLessonTitle(activeLesson)}
                </h2>
                {activeLesson && (
                  <div className="flex items-center gap-3">
                    <div className="w-40 bg-[#0a1f1f] rounded-full h-2.5 border border-[#FCA5A530]">
                      <div
                        className="bg-gradient-to-r from-[#2cc295] to-[#FCA5A5] h-2.5 rounded-full"
                        style={{
                          width: `${
                            (calculateLessonProgress(activeLesson).completed /
                              calculateLessonProgress(activeLesson).total) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <div className="progress-text text-sm text-white bg-[#0a1f1f] px-3 py-1 rounded-full border border-[#FCA5A530]">
                      {calculateLessonProgress(activeLesson).completed}/
                      {calculateLessonProgress(activeLesson).total}
                      {calculateLessonProgress(activeLesson).allDone && (
                        <span className="ml-2 completed-badge">✓</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Exercises Table */}
          <div className="content-panel rounded-xl p-5 bg-gradient-to-br from-[#0a1f1f] to-[#011414] border border-[#FCA5A530] backdrop-blur-sm">
            <h3 className="text-xl md:text-2xl mb-5 text-white font-semibold tracking-tight">
              Exercises
            </h3>

            {activeLesson ? (
              loadingStatus.exercises ? (
                <div className="flex justify-center py-8">
                  <div className="spinner animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#2cc295]"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="exercise-table min-w-full">
                    <thead>
                      <tr className="border-b border-[#FCA5A550]">
                        <th className="py-4 px-4 text-left text-white font-medium uppercase tracking-wider">
                          Exercise
                        </th>
                        <th className="py-4 px-4 text-left text-white font-medium uppercase tracking-wider">
                          Title
                        </th>
                        <th className="py-4 px-4 text-left text-white font-medium uppercase tracking-wider">
                          XP
                        </th>
                        <th className="py-4 px-4 text-left text-white font-medium uppercase tracking-wider">
                          Status
                        </th>
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
                              className={`border-b border-[#FCA5A520] ${
                                isUnlocked && lessonUnlockStatus[activeLesson]
                                  ? "hover:bg-[#2cc29508] cursor-pointer"
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
                              <td className="py-4 px-4 text-white">
                                <div className="flex items-center">
                                  <span className="mr-2">
                                    Exercise {index + 1}
                                  </span>
                                  {!isUnlocked && index > 0 && (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4 text-[#FCA5A5] ml-1"
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
                              <td className="py-4 px-4 text-white">
                                {exercise.title}
                              </td>
                              <td className="py-4 px-4 text-[#2cc295] font-medium">
                                +{exercise.xp_reward} XP
                              </td>
                              <td className="py-4 px-4">
                                {exercise.completed ? (
                                  <span className="completed-badge flex items-center text-[#2cc295]">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-5 w-5 mr-1"
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
                                        Start Now
                                      </button>
                                    ) : (
                                      <span className="locked-text text-[#FCA5A5]">
                                        {!lessonUnlockStatus[activeLesson]
                                          ? "Complete Previous Lesson"
                                          : !isUnlocked
                                          ? "Complete Previous Exercise"
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
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-[#FCA5A530] rounded-lg">
                <div className="text-[#FCA5A5] text-5xl mb-4">⌨️</div>
                <p className="text-[#aacbc4] text-lg italic">
                  Select a lesson to view its exercises
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversityIntro;
