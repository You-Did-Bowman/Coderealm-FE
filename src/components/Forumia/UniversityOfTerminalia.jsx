import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import userImage from "../../assets/images/userImage.jpeg";
import { UserContext } from "../../contexts/userIdContext";

const UniversityOfTerminalia = ({ posts }) => {
  const navigate = useNavigate();
  const [profileAvatar, setProfileAvatar] = useState({});
  const { token } = useContext(UserContext);

  const universityPosts = [
    {
      id: 1,
      title: "HTML",
      description:
        "Ask your questions about the lessons in the HTML course, Share your knowledge",
      post: posts.filter((p) => p.community === "HTML"),
    },
    {
      id: 2,
      title: "CSS",
      description:
        "Ask your questions about the lessons in the CSS course, Share your knowledge",
      post: posts.filter((p) => p.community === "Css"),
    },
    {
      id: 3,
      title: "JavaScript",
      description:
        "Ask your questions about the lessons in the JavaScript course, Share your knowledge",
      post: posts.filter((p) => p.community === "JavaScript"),
    },
  ].map((item) => {
    const postsLength = item.post.length;
    const latestPost = postsLength > 0 ? item.post[postsLength - 1] : null;

    return {
      ...item,
      postsLength,
      latestPost,
    };
  });

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

      // console.log("data", data);

      setProfileAvatar((prevAvatars) => ({
        ...prevAvatars,
        [userId]: data.image_url || userImage,
      }));
    } catch (error) {
      console.error("Error fetching profileAvatarfor user: ", userId, error);
    }
  };

  useEffect(() => {
    universityPosts.forEach((item) => {
      const userId = item.latestPost?.user_id;
      if (userId && !profileAvatar[userId]) {
        fetchProfileAvatar(userId);
      }
    });
  }, [universityPosts, profileAvatar]);

  // console.log("profileAvatar:", profileAvatar);

  return (
    <article className="w-[90%] max-w-full mx-auto mt-10 p-6">
      <h3 className="text-white border-b-4 py-4 border-accent font-vt323 text-[25px] font-normal">
        University of Terminalia
      </h3>

      <div className="flex flex-col mt-5">
        {universityPosts.map((item) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-accent min-h-[64px] cursor-pointer hover:bg-secondary/20 p-3 hover:rounded-md transition-colors"
            role="button"
          >
            {/* Left side */}
            <div
              className="flex gap-4 w-full sm:w-2/3 items-center"
              onClick={() => navigate(`/forumia/posts/${item.title}`)}
            >
              <div className="text-white text-sm">
                <p className="font-bold text-md mb-1">{item.title}</p>
                <div className="text-[11px] flex gap-1">
                  <span>{item.description}</span>
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center w-full sm:w-1/3 mt-4 sm:mt-0 justify-between text-white text-sm min-h-[64px]">
              <div className="relative pl-4 ml-4 flex flex-col text-[11px] items-center ">
                Posts
                <span className="px-2">{item.postsLength}</span>
              </div>

              {item.postsLength > 0 && (
                <div className="relative w-3/5 pl-4 ml-4 flex justify-evenly items-center gap-4 before:absolute before:top-2 before:left-0 before:h-4/5 before:w-[2px] before:bg-secondary before:rounded">
                  <a
                    onClick={() =>
                      navigate(`/profile/${item.latestPost.user_id}`)
                    }
                  >
                    <img
                      src={profileAvatar[item.latestPost?.user_id] || userImage}
                      alt="user"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  </a>
                  <div className="flex w-3/5 flex-col items-start text-[11px] max-w-[100px]">
                    <p className="overflow-hidden text-ellipsis whitespace-nowrap w-full block text-left">
                      From:
                    </p>
                    <a
                      onClick={() =>
                        navigate(`/profile/${item.latestPost.user_id}`)
                      }
                    >
                      {item.latestPost.author}
                    </a>
                    <span className="text-accent">
                      {item.latestPost?.created_at
                        ? new Date(
                            item.latestPost.created_at
                          ).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
};

export default UniversityOfTerminalia;
