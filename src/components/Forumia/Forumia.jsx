/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import userImage from "../../assets/images/userImage.jpeg";
import { useState, useContext, useEffect } from "react";
import General from "./General";
import SinglePostAndComments from "../SinglePostAndComments/SinglePostAndComments";
import UniversityOfTerminalia from "./UniversityOfTerminalia";
import TheHub from "./TheHub";
import { UserContext } from "../../contexts/userIdContext";
import { useNavigate } from "react-router-dom";
import CreatePost from "../CreatePost/CreatePost";
import "./_forumia.scss";

export default function Forumia() {
  // -*-*- STATES -*-*-
  const [calcMembers, setCalcMembers] = useState(null);
  /*   const [threadCount, setThreadCount] = useState(0); */
  const [renderSinglePostPage, setRenderSinglePostPage] = useState(false);
  const [singlePostInfos, setSinglePostObject] = useState({});
  const [profileAvatar, setProfileAvatar] = useState({});
  const [amountPosts, setAmountPosts] = useState();
  const [newPost, setNewPost] = useState(false);

  // -*-*- CONTEXTS -*-*-
  const { posts, userId, setPosts, fetchingData, token } =
    useContext(UserContext);

  const LIMIT = 10; // Define a constant for the limit of posts per page
  const navigate = useNavigate();

  // useEffect(() => {
  //   fetchingData();
  // }, [posts, fetchingData]);

  useEffect(() => {
    fetchingData(LIMIT, 0);
    // setOffset(LIMIT); // next offset will be LIMIT
    console.log("Fetching data called");
  }, []);

  /*   // Calculating Threads
  useEffect(() => {
    const total = posts.reduce((acc, post) => {
      return acc + 1 + (post.comments?.length || 0);
    }, 0);
    setThreadCount(total);
  }, [posts]); */

  // Calculating Members
  useEffect(() => {
    const members = new Set();

    posts.forEach((post) => {
      // Add post author
      if (post.author) members.add(post.author);

      // Add comment commenter
      post.comments?.forEach((comment) => {
        if (comment.commenter) members.add(comment.commenter);
      });
    });

    setCalcMembers(members.size);
    // Optional: log who they are
  }, [posts]);

  // Sending The user to the single Post
  const oneSinglePost = (post) => {
    setSinglePostObject(post);
    setRenderSinglePostPage(true);
  };

  // Delete a single post
  const deleteSinglePost = async (postId) => {
    try {
      console.log("Attempting to delete post with ID:", postId);

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/posts/${postId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      // const data = await res.json();

      if (!res.ok) {
        throw new Error("Failed to delete post");
      }

      // Remove the post from the state
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  // JB: Fetch all avatars and put them into a state-object to grab it later
  const fetchProfileAvatar = async (userId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/${userId}/getProfilPic`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      setProfileAvatar((prevAvatars) => ({
        ...prevAvatars,
        [userId]: data.image_url || userImage,
      }));
    } catch (error) {
      console.error("Error fetching profileAvatarfor user: ", userId, error);
    }
  };

  // JB: count all posts in the DB
  const countAllPosts = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/posts/count/allPosts`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      setAmountPosts(data[0].count);
    } catch (error) {
      console.error("FE - Error fetching the amount of posts: ", error);
    }
  };

  useEffect(() => {
    posts.forEach((post) => {
      if (post.user_id && !profileAvatar[post.user_id]) {
        fetchProfileAvatar(post.user_id);
      }
    });
    countAllPosts();
  }, [posts]);

  return (
    <section className="gradient-bg">
      {/* Header */}
      <div className="header-container relative w-full h-[250px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10">
          <h1 className=" font-bold text-center tracking-wide text-white floating-animation">
            <span className="highlight-text">FORUMIA</span>
          </h1>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1f1f] via-[#002d28] to-[#0a1f1f] opacity-95"></div>
        <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-[#011414] to-transparent"></div>

        {/* Animated floating elements */}
        <div className="absolute top-1/4 left-1/4 w-6 h-6 rounded-full bg-[#2cc295] opacity-20 floating-element-1"></div>
        <div className="absolute top-1/3 right-1/4 w-8 h-8 rounded-full bg-[#FCA5A5] opacity-15 floating-element-2"></div>
        <div className="absolute bottom-1/4 left-1/2 w-10 h-10 rounded-full bg-[#2cc295] opacity-10 floating-element-3"></div>
      </div>

      {/* Background bubbles */}
      <div className="gradient-container">
        <div className="g1"></div>
        <div className="g2"></div>
        <div className="g3"></div>

        {/* Content */}
        <>
          {/* overlay with the single post component  */}
          {renderSinglePostPage && (
            <SinglePostAndComments
              post={posts}
              singlePostInfos={singlePostInfos}
              setSinglePostObject={setSinglePostObject}
              setRenderSinglePostPage={setRenderSinglePostPage}
              refreshPosts={() => fetchingData(LIMIT, 0)}
            />
          )}
          <main className="flex flex-col p-5">
            <div className="flex flex-col md:flex-row gap-10  m-auto w-[80%] px-4 md:px-0">
              {/* left side */}
              {/* TOP */}
              <section className=" w-full md:w-1/3 space-y-8 ">
                <article className="forumiaTopContainer p-6 text-white  border-2 max-h-[450px] overflow-y-auto  custom-scrollbar  border-accent rounded-md md:rounded-2xl shadow-[0_8px_30px_rgba(200,200,180,0.2)]">
                  <h3 className="font-vt323 w-full  text-[25px] font-normal text-accent">
                    Top
                  </h3>

                  {posts.length === 0 ? (
                    <p className="text-white text-sm mt-4">
                      No Available Posts{" "}
                    </p>
                  ) : (
                    posts.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => oneSinglePost(post)}
                        className="forumiaPost relative mt-6 w-full  cursor-pointer p-3 rounded-md overflow-hidden flex items-center gap-4 border border-gray-700"
                      >
                        {/* Delete Button - styled and positioned in top-right */}

                        {Number(userId) === post.user_id && (
                          <p
                            aria-label="Delete post"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent parent div click
                              deleteSinglePost(post.id);
                            }}
                            className="absolute top-2 right-2 text-gray-400  hover:text-red-500 text-md bg-red font-bold transition duration-200"
                            title="Delete Post"
                          >
                            ×
                          </p>
                        )}

                        <a onClick={() => navigate(`/profile/${post.user_id}`)}>
                          <img
                            className="object-cover w-12 h-12 rounded-full"
                            src={profileAvatar[post.user_id] || userImage} // Fallback to userImage if no profileAvatar
                            alt="user avatar"
                          />
                        </a>

                        <div className="flex flex-col gap-1">
                          <p className="font-semibold truncate">
                            {post.title || "No content"}
                          </p>
                          <a
                            onClick={() => navigate(`/profile/${post.user_id}`)}
                            className="text-[11px] text-accent flex gap-1"
                          >
                            {post.author}
                          </a>
                          <span className="text-[11px] text-gray-400">
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </article>

                {/* Stats */}
                {
                  <article className="forumiaStatsContainer p-6 text-white  border-2 border-accent rounded-md md:rounded-2xl shadow-[0_8px_30px_rgba(200,200,180,0.2)]">
                    <h3 className="font-vt323 text-[25px] font-normal  text-accent">
                      Forum Statistics
                    </h3>
                    <ul className="mt-6 flex flex-col gap-4 max-w-xs">
                      <li className="flex justify-between w-full">
                        Posts: <span>{amountPosts || "...loading"}</span>
                      </li>
                      <li className="flex justify-between w-full">
                        Members: <span>{calcMembers}</span>
                      </li>
                      <li className="hover:cursor-pointer flex justify-between w-full">
                        Latest Member:{" "}
                        <a
                          onClick={() =>
                            navigate(
                              `/profile/${posts[posts.length - 1].user_id}`
                            )
                          }
                        >
                          {posts?.[posts.length - 1]?.author || "N/A"}
                        </a>
                      </li>
                    </ul>
                  </article>
                }
              </section>

              {/* right side */}
              <aside className="forumiaMainContainer w-full border-2 bg-[#0323;] border-accent rounded-md md:rounded-2xl z-10  py-14 shadow-[0_8px_30px_rgba(255,255,255,0.4)]">
                {/* Buttons */}
                <article className="flex gap-4 justify-end items-center px-6">
                  <button onClick={() => setNewPost(true)} className="">
                    New Post
                  </button>
                </article>
                {/* Create Post Overlay */}
                {newPost && (
                  <CreatePost
                    fetchingData={() => fetchingData(LIMIT, 0)}
                    setNewPost={setNewPost}
                  />
                )}
                {/* Latest Posts */}
                <article className="forumiaLatestContainer border border-dashed  w-[90%] max-w-full mx-auto mt-10 p-6  rounded-md">
                  <h3 className="text-accent mb-8 font-vt323 text-[25px] font-normal ">
                    Latest Posts
                  </h3>

                  {posts.length > 0 ? (
                    posts.slice(0, 3).map((post) => (
                      <div
                        onClick={() => oneSinglePost(post)}
                        key={post.id}
                        className="forumiaPost relative cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-accent last:border-none pb-4 p-3 transition-colors"
                        role="button"
                        tabIndex={0}
                      >
                        {/* ❌ Delete Button (conditionally shown for post author) */}
                        {Number(userId) === post.user_id && (
                          <p
                            aria-label="Delete post"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevents triggering post click
                              deleteSinglePost(post.id);
                            }}
                            className="absolute top-0 right-2 w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 text-2xl font-bold transition duration-200 cursor-pointer"
                            title="Delete Post"
                          >
                            ×
                          </p>
                        )}

                        {/* Left side */}
                        <div className="flex gap-4 w-full sm:w-2/3 items-center">
                          <a
                            onClick={() => navigate(`/profile/${post.user_id}`)}
                          >
                            <img
                              className="object-cover w-12 h-12 rounded-full"
                              src={profileAvatar[post.user_id] || userImage} // Fallback to userImage if no profileAvatar
                              alt="user avatar"
                            />
                          </a>
                          <div className="text-white text-sm">
                            <p className="font-bold text-md mb-1">
                              {post.title}
                            </p>
                            <div className="text-[11px] text-accent flex gap-1">
                              <a
                                onClick={() =>
                                  navigate(`/profile/${post.user_id}`)
                                }
                              >
                                {post.author}
                              </a>
                              -
                              <span>
                                {new Date(post.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right side */}
                        <div className="flex gap-6 items-center w-full sm:w-1/3 mt-4 sm:mt-0 justify-evenly text-white text-sm relative">
                          <p className="flex flex-col text-[11px] items-center">
                            Answers
                            <span className="px-2">{post.comments.length}</span>
                          </p>
                          {post.comments.length > 0 && (
                            <div className="relative flex items-center gap-4 before:absolute before:left-[-15px] before:h-full before:w-[2px] before:bg-secondary before:rounded">
                              {/*  <a
                            onClick={() => navigate(`/profile/${post.user_id}`)}
                          >
                            <img
                              className="object-cover w-12 h-12 rounded-full"
                              src={profileAvatar[post.user_id] || userImage} // Fallback to userImage if no profileAvatar
                              alt="user avatar"
                            />
                          </a> */}
                              <p className="flex flex-col items-center text-[11px]">
                                {
                                  post.comments[post.comments.length - 1]
                                    .commenter
                                }
                                <span className="text-[11px] text-accent">
                                  {" "}
                                  {new Date(
                                    post.comments[
                                      post.comments.length - 1
                                    ].created_at
                                  ).toLocaleDateString()}
                                </span>
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-white text-sm mt-4">
                      No Available Posts{" "}
                    </p>
                  )}
                </article>

                {/* -*-*- COMMUNITIES -*-*- */}
                {/*General */}
                <General posts={posts} />

                {/*University of Terminalia */}
                <UniversityOfTerminalia
                  posts={posts}
                  fetchProfileAvatar={fetchProfileAvatar}
                />

                {/*The Hub */}
                <TheHub posts={posts} fetchProfileAvatar={fetchProfileAvatar} />
              </aside>
            </div>
          </main>
        </>
      </div>
    </section>
  );
}
