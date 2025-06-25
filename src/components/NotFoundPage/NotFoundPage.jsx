import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../NavBar/NavBar";
import { UserContext } from "../../contexts/userIdContext"; // adjust path if needed
import "./_notFoundPage.scss";

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { token, userId } = useContext(UserContext);



  const navBack = () => {
    const savedToken = token || localStorage.getItem("token");
    const savedUserId = userId || localStorage.getItem("userId");
  
    if (savedToken && savedUserId) {
      // Redirect to landing page if token and userId exist
      navigate(`/landingPageUser/${savedUserId}/${savedToken}`);
    } else {
      // Otherwise, send to login page
      navigate("/login", { replace: true });
    }
  };

  return (
    <>
      <NavBar />
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#000704] px-4">
        <div className="bg-white shadow-lg rounded-2xl p-10 text-center max-w-md w-full">
          <h1 className="text-7xl font-bold text-blue-600 mb-4">404</h1>
          <p className="text-gray-700 text-lg mb-6">
            Oops! The page you're looking for doesn't exist.
          </p>
          <button
            onClick={navBack}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            Go Back Home
          </button>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;
