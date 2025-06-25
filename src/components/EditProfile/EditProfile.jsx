import { useContext, useState } from "react";
import { UserContext } from "../../contexts/userIdContext";
import { useNavigate } from "react-router-dom";
import "./_editProfile.scss";

function EditProfile() {
  // -*-*- Hooks: States, Contexts ... -*-*-
  const { userId, avatar, setAvatar, token } = useContext(UserContext);

  // JB: userId is stored as a string at the localStorage therefore we need to change it into a Number to work with this at the BE - the 10 stands for decimal number
  const [formData, setFormData] = useState({ id: parseInt(userId, 10) });

  const [file, setFile] = useState();

  const navigate = useNavigate();

  // -*-*- Handlers -*-*-
  //JB: Let's make magic happen when change the input fields
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    //JB: Do not reset the page! Never! EVER!
    e.preventDefault();

    //JB: instead try to fetch the api to update the user (postman can do this but the stupid browser is stupid)
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/${userId}/edit`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      alert("Successfully updated!")

      if (!res.ok) {
        throw new Error("Failed to update user");
      }
    } catch (error) {
      console.error("Edit error:", error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("image", file);
    formData.append("userId", userId);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/${userId}/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          credentials: "include",
          body: formData,
        }
      );

      alert("Successfully updated!")

      if (!res.ok) {
        throw new Error("Failed to upload file!");
      }
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  return (
    <>
      <div className="gradient-bg">
        <div className="gradient-container">
          <div className="g1"></div>
          <div className="g2"></div>
          <div className="g3"></div>
          <div className="g4"></div>
          <div className="profileContentWrapper"></div>

          <div className="editWrapper">
            <div className="editContainer">
            <form encType="multipart/form-data" className="formUpload">
              <h2>Upload an avatar: </h2>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <button onClick={handleUpload}>
                Upload
              </button>
            </form>

            <div className="corruption-line editLine1 w-full h-1"></div>

            <form
              action=""
              method="put"
              onSubmit={handleSubmit}
              className="infoForm"
            >
              <h2>Edit informations about you:</h2>
              <div className="inputLocation">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  onChange={handleChange}
                  value={formData.location || ""}
                  placeholder="Your location"
                />
              </div>
              <div className="inputInfo">
                <label>Write something about you: </label>
                <textarea
                  name="info"
                  id="info"
                  onChange={handleChange}
                  value={formData.info || ""}
                  placeholder="Tell us something about you ..."
                ></textarea>
              </div>
              <div className="inputSocial">
                <label>Social:</label>
                <input
                  type="text"
                  name="social"
                  onChange={handleChange}
                  value={formData.social || ""}
                  placeholder="Instagram, Github, etc."
                />
              </div>
              <button type="submit" >
                Save changes
              </button>
            </form>

             <div className="corruption-line editLine2 w-full h-1"></div> 

            <button
              onClick={() => navigate("/users/reset-password/:token")}
             
              className="buttonPassword"
            >
              Reset Password
            </button>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}

export default EditProfile;
