import React, { useState } from "react";
import "./_createPost.scss";

const CreatePost = ( { fetchingData,setNewPost}) => {

  const [title, setTitle] = useState("");
  const [community, setCommunity] = useState("");
  const [textValue, setTextValue] = useState("");
  const [message, setMessage] = useState("");
  const communities = [
    { id: 1, name: "Rules" },
    { id: 2, name: "Hello-world" },
    { id: 3, name: "HTML" },
    { id: 4, name: "Css" },
    { id: 5, name: "JavaScript" },
    { id: 6, name: "Off-Topic" },
    { id: 7, name: "General-Discussions" },
  ];
  const sendingThePost = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/posts`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          community_id: parseInt(community, 10),
          body: textValue,
        }),
      });

      if (!res.ok) {
        console.log("error");
        throw new Error(`HTTP error! status: ${res.status}`);
     
      }

      const data = await res.json();
      console.log("Post sent successfully:", data);
      setTitle("");
      setCommunity("");
      setTextValue("");
      setMessage("Post created successfully!");
      fetchingData();
    setTimeout(() => {
     
      setNewPost(false)
    },2000)
       
    } catch (error) {
      console.error("Error sending the post:", error);
    }
  };

  return (
    <div className="min-h-screen w-full  z-10 top-0 left-0 fixed bg-[#0f0f1c]/90 flex items-center justify-center px-4 py-10">
       
      <section className="createPostContainer w-full max-w-3xl p-6 rounded-2xl shadow-[0_8px_30px_rgba(255,255,255,0.4)]">
      <p    onClick={() => {
 
    setNewPost(false);
  }} className=" cursor-pointer border-none float-right w-[25px] font-bold text-white text-xl hover:text-red-500 flex items-center justify-center "  role="close">X</p>
        <h2 className="text-white text-3xl mb-6 pb-2">
          Create New Post
        </h2>

         <div className="corruption-line w-full h-1"></div>

        <form onSubmit={sendingThePost} className="flex flex-col gap-6">
          {/* Title */}
          <div>
            <label className="block text-white text-sm mb-2">Title</label>
            <input
              type="text"
              className="createPostInput w-full p-3 rounded-md bg-[#1e1e2f] border focus:outline-none"
              placeholder="Post title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Community */}
          <div>
            <label className="block text-white text-sm mb-2">Community</label>
            <select
              className="w-full p-3 rounded-md bg-[#1e1e2f] border focus:outline-none"
              value={community}
              onChange={(e) => setCommunity(e.target.value)}
              required
            >
              <option value="" disabled>
                Select a community
              </option>
              {communities.map((comm) => (
                <option key={comm.id} value={comm.id}>
                  {comm.name}
                </option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="block text-white text-sm mb-2">Your Post</label>
            <textarea
              className="w-full p-4 h-64 rounded-md bg-[#1e1e2f] text-white border focus:outline-none resize-none"
              placeholder="Write your post here..."
              onChange={(e) => setTextValue(e.target.value)}
              value={textValue}
              required
            />
              <p className="text-green-500 text-sm">{message}</p> 
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="self-end bg-primary rounded-2xl px-6 py-2 text-sm font-medium text-white shadow-[0_0px_12px_rgba(171,239,254,0.5),0_0px_40px_rgba(0,254,254,0.2)] hover:shadow-[0_0px_12px_rgba(171,239,254,0.5),0_0px_40px_rgba(171,239,254,0.25)]"
          >
            Publish
          </button>
        </form>
      </section>
    </div>
  );
};

export default CreatePost;
