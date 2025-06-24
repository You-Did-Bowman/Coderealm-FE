import React, { useState, useEffect, useContext } from "react";
import LandingPageUserCards from "./LandingPageUserCards";
import { useParams } from "react-router-dom";
import { UserContext } from "../../contexts/userIdContext";
import placeholderAvatar from "../../assets/images/placeholder_Avatar.jpg";
import "./_landingPageUser.scss";

const LandingPageUser = () => {
  const {
    setUserId,
    token,
    avatar,
    userProgress,
    userData,
    setUserProgress,
    setUserData,
    setAvatar,
  } = useContext(UserContext);

  const { id } = useParams();

  useEffect(() => {
    if (id) {
      setUserId(id);
    }
  }, [id, setUserId]);

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
      const endpoint = id
        ? `${import.meta.env.VITE_BACKEND_URL}/api/user/${id}`
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

  const fetchAvatar = async () => {
    try {
      const currentToken = token || localStorage.getItem("token");
      if (!currentToken) {
        console.error("No token available for API call");
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/${id}/getProfilPic`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch avatar at LPU!");
      }

      const data = await res.json();
      const imageUrl = data.image_url;

      // console.log(data);
      // console.log(imageUrl);

      setAvatar(imageUrl);
    } catch (error) {
      console.error("Error fetching profile picture:", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchUserProgress();
      fetchUserData();
      fetchAvatar();
    }
  }, [id, token]);

  const sendInvite = async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;

    // console.log(email ? email : "No Mail");

    try {
      const currentToken = token || localStorage.getItem("token");
      if (!currentToken) {
        console.error("No token available for API call");
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/users/sendInviteMail`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      console.log(("FE - res:", res));

      if (res.ok) {
        alert("Invitation is send!");
      } else {
        alert("Invitation coulnd't be send!");
      }
    } catch (error) {
      console.error("FE - Error sending mail to BE:", error);
    }
  };

  return (
    <div className="gradient-bg">
      <div className="gradient-container">
        <div className="g1"></div>
        <div className="g2"></div>
        <div className="g3"></div>

        {/* JB: Stats */}
        <div className="lpuHeaderWrapper">
          {/* JB: User stats overview */}
          <div className="statsWrapper">
            {/*  JB: Profile stats */}
            <article className="lpuProfileWrapper">
              <div className="lpuProfileContainer">
                <img
                  loading="lazy"
                  src={avatar || placeholderAvatar}
                  alt="userImage"
                />
                <h2 className="lpuUsername">
                  {userData?.username || "Loading..."}
                </h2>
                <p>Level {userData?.level || 1}</p>
              </div>
            </article>

            {/* JB: Progress stats */}
            <article className="progressWrapper">
              <div className="progressContainer">
                <h3>Your Progress</h3>

                <div className="lpuProgressFlex">
                  <p>Badges:</p>
                  <p> {userData?.badgesCount || 0}</p>
                </div>

                <div className="lpuProgressFlex">
                  <p>XP: </p>
                  <p> {userData?.xp || 0}</p>
                </div>

                <div className="lpuProgressFlex">
                  <p>Rank: </p>
                  <p> # {userData?.rank || "N/A"}</p>
                </div>

                {userProgress ? (
                  <>
                    <div className="lpuProgressFlex">
                      <p>Completed:</p>{" "}
                      <p>
                        {" "}
                        {userProgress.completedExercises} /{" "}
                        {userProgress.totalExercises}
                      </p>
                    </div>
                    <div className="lpuProgressFlex">
                      <p> Next: </p>
                      {userProgress.nextExercise && (
                        <p>{userProgress.nextExercise.title}</p>
                      )}
                    </div>
                  </>
                ) : (
                  <p>Loading progress...</p>
                )}
              </div>
            </article>
          </div>
          <div className="lpuCave"></div>
        </div>

        {/* JB: Heading Explore Coderealm */}
        <div className="lpuExploreBar">
          <h2 className="lpuExploreH2">
            Explore the <span className=" ">REALM</span>
          </h2>
        </div>

        <LandingPageUserCards />

        {/* JB: Invite friend section */}
        <div className="lpuInvite">
          <h3>
            Invite a <span>Friend</span>
          </h3>
          <p>
            Having fun with CODEREALM? Share the love with a friend (or two)!
            Enter their email, and we'll send them a personal invite to join the
            community.
          </p>
          <div className="">
            <input
              type="email"
              placeholder="Enter friend's email"
              className="px-4 py-2 w-full sm:w-72 rounded-md border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent text-gray-800"
              id="email"
            />
            <button onClick={sendInvite}>Send Invite</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPageUser;
