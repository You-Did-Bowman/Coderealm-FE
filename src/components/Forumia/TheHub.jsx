import React, { useState, useEffect, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import userImage from "../../assets/images/userImage.jpeg";
import { UserContext } from "../../contexts/userIdContext";

const TheHub = ({ posts }) => {
  const navigate = useNavigate();
  const [profileAvatar, setProfileAvatar] = useState({});
  const [communityPostCount, setCommunityPostCount] = useState({});
  const { token } = useContext(UserContext);

  const hubPosts = useMemo(() => {
    return [
      {
        id: 6,
        title: "Off-Topic",
        description: "Whatever comes to your mind",
        post: posts.filter((p) => p.community === "Off-Topic"),
      },
      {
        id: 7,
        title: "General-Discussions",
        description: "Whatever comes to your mind",
        post: posts.filter((p) => p.community === "General-Discussions"),
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
  }, [posts]);

  const fetchCommunityPostCount = async (communityId) => {
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/posts/count/community/${communityId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      return data.count || 0;
    } catch (err) {
      console.error(
        `Error fetching post count for community ${communityId}:`,
        err
      );
      return 0;
    }
  };

  useEffect(() => {
    const fetchCounts = async () => {
      const counts = {};
      for (const item of hubPosts) {
        const count = await fetchCommunityPostCount(item.id);
        counts[item.id] = count;
      }
      setCommunityPostCount(counts);
    };

    if (hubPosts.length > 0) {
      fetchCounts();
    }
  }, [hubPosts]);

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
      console.error("Error fetching profile avatar for user: ", userId, error);
    }
  };

  useEffect(() => {
    hubPosts.forEach((item) => {
      const userId = item.latestPost?.user_id;
      if (userId && !profileAvatar[userId]) {
        fetchProfileAvatar(userId);
      }
    });
  }, [hubPosts, profileAvatar]);

  return (
    <article className="w-[90%] max-w-full mx-auto mt-10 p-6">
      <h3 className="text-white font-vt323 text-[25px] font-normal">The Hub</h3>

      <div className="corruption-line w-full h-1"></div>

      <div className="flex flex-col mt-5">
        {hubPosts.map((item) => (
          <div
            key={item.id}
            className="forumiaPost flex flex-col sm:flex-row justify-between items-start sm:items-center last:border-none border-b-2 border-accent min-h-[64px] cursor-pointer  transition-colors"
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
              <div className="relative pl-4 ml-4 flex flex-col text-[11px] items-center">
                Posts
                <span className="px-2">
                  {communityPostCount[item.id] === undefined
                    ? "Loading..."
                    : communityPostCount[item.id]}
                </span>
              </div>

              {item.postsLength > 0 && (
                <div className="relative w-3/5 justify-evenly pl-4 ml-4 flex items-center gap-4 before:absolute before:top-2 before:left-0 before:h-4/5 before:w-[2px] before:bg-white before:rounded">
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

export default TheHub;
