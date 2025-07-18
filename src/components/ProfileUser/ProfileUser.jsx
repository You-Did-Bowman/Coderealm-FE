import ProgressBar from "@ramonak/react-progress-bar";
import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UserContext } from "../../contexts/userIdContext";
import placeholderAvatar from "../../assets/images/placeholder_Avatar.jpg";
import "./_profileUser.scss";

function ProfilNav() {
  // -*-*- Hooks: State, Navigate -*-*-
  const { userId, token } = useContext(UserContext);
  const [userProgress, setUserProgress] = useState(null);
  const [userData, setUserData] = useState(null);
  const [badges, setBadges] = useState([]);
  const [badgesWithPics, setBadgesWithPics] = useState([]);
  const [posts, setPosts] = useState([]);
  const [profileAvatar, setProfileAvatar] = useState();

  const { id } = useParams();
  // console.log("params id:", id);

  const profileId = id;
  // console.log(profileId);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProgress = async () => {
      try {
        // Get token from context or localStorage
        const currentToken = token || localStorage.getItem("token");

        if (!currentToken) {
          console.error("No token available for API call");
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/progress`,
          {
            headers: {
              Authorization: `Bearer ${currentToken}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Progress fetch failed:", {
            status: response.status,
            statusText: response.statusText,
            error: errorData,
          });

          throw new Error(errorData.error || "Failed to fetch progress");
        }

        const data = await response.json();
        // console.log("progressData: ", data);

        setUserProgress(data);
      } catch (error) {
        console.error("Error fetching progress:", error);
      }
    };

    const fetchUserData = async () => {
      try {
        // Get token from context or localStorage
        const currentToken = token || localStorage.getItem("token");

        if (!currentToken) {
          console.error("No token available for API call");
          return;
        }

        // Use /me endpoint if no id is provided, otherwise use /:id endpoint
        const endpoint = userId
          ? `${import.meta.env.VITE_BACKEND_URL}/api/user/${profileId}`
          : `${import.meta.env.VITE_BACKEND_URL}/api/user/me`;

        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          console.error("User data fetch failed:", {
            status: response.status,
            statusText: response.statusText,
            error: errorData,
            endpoint,
          });

          throw new Error(errorData.error || "Failed to fetch user data");
        }

        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const fetchBadges = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/${profileId}/getBadges`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        const badgesJsn = await response.json();
        const badgesArray = Object.values(badgesJsn);
        setBadges(badgesArray[0]);
      } catch (error) {
        console.error("Error fetching badges: ", error);
      }
    };

    const fetchPosts = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/posts/userPosts/${profileId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        const postsJsn = await response.json();

        // console.log(postsJsn);

        setPosts(postsJsn);
      } catch (error) {
        console.error("FE - Error fetching user posts: ", error);
      }
    };

    const fetchProfileAvatar = async () => {
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/user/${profileId}/getProfilPic`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        setProfileAvatar(data.image_url);
      } catch (error) {
        console.error("Error fetching profileAvatar:", error);
      }
    };

    if (profileId) {
      fetchUserProgress();
      fetchUserData();
      fetchBadges();
      fetchPosts();
      fetchProfileAvatar();
    }
  }, [profileId, token]);

  const readDateForPosts = () => {
    const readableDates = [];

    posts?.map((post) => {
      const date = new Date(post.created_at);
      const readableDate = date.toLocaleDateString("en-EN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      readableDates.push(readableDate);
    });

    return readableDates;
  };

  const readDate = () => {
    const date = new Date(userData?.created_at);
    const readableDate = date.toLocaleDateString("en-EN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return readableDate;
  };

  const joined = readDate();
  const dates = readDateForPosts();

  // console.log(posts);

  return (
    <>
      <div className="gradient-bg">
        <div className="gradient-container">
          <div className="g1"></div>
          <div className="g2"></div>
          <div className="g3"></div>
          <div className="g4"></div>
          <div className="profileContentWrapper">
            <div className="profileHeader"></div>
            {userData ? (
              <div className="profileWrapper">
                <div className="profileAvatar">
                  <img src={profileAvatar || placeholderAvatar} />
                  <div>{userData.username}</div>
                </div>

                <div className="profileInfo">
                  <div>
                    <h2>Info</h2>
                    {userData.info === 0 ? "" : userData.info}
                  </div>
                  <div>
                    <h3>Location</h3> <p>{userData.location}</p>
                  </div>
                  <div>
                    <h3>Joined</h3> <p>{joined}</p>
                  </div>
                  <div>
                    <h3>Social</h3>
                    <a
                      href={
                        userData?.social
                          ? userData.social.startsWith("http")
                            ? userData.social
                            : `https://${userData.social}`
                          : "https://default.com" // Default-Wert
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {userData?.social || "-"} {/* Default-Text */}
                    </a>
                  </div>
                  {userId === profileId ? (
                    <button onClick={() => navigate("/edit-profile")}>
                      Edit Profile
                    </button>
                  ) : (
                    <div></div>
                  )}
                </div>

                <div className="line1 corruption-line w-full h-1"></div>

                <div className="profileStats">
                  <h2>XP</h2>
                  <ProgressBar
                    className="xpBar"
                    maxCompleted={300}
                    completed={userData.xp}
                    customLabel={userData.xp}
                  />
                </div>

                <div className="line2 corruption-line w-full h-1"></div>

                <div className="profileBadges">
                  <h2>Badges</h2>
                  <div className="singleBadge">
                    {badges?.map((badge, index) => (
                      <div key={index}>
                        <img
                          className="badgePic"
                          src={badge.url}
                          alt={badge.name}
                        />
                        <h3>{badge.name}</h3>
                        <p>{badge.description}</p>
                        <p className="badgeDep">{badge.dependency}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="profilePosts">
                  <h2>Posts</h2>
                  {posts?.map((post, index) => (
                    <div key={index}>
                      <h3>{post.title}</h3>
                      <p>{post.body}</p>
                      <p className="dateProfile">{dates[index]}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p>... Data loading ...</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ProfilNav;
