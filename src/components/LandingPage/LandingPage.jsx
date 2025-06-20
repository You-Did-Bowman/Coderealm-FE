import React from "react";
// import Frame3 from "../../assets/images/Frame3.png";
import { NavLink } from "react-router-dom";
import AnimatedCoderealm from "./AnimatedCoderealm";

const LandingPage = () => {
  return (
    <section className="bg-background min-h-screen flex flex-col">
      <div className=" border-2 border-secondary p-6 sm:p-8 md:p-12 lg:p-40 flex flex-col justify-evenly items-center w-[90%] sm:w-11/12 md:w-4/5 gap-8 m-auto rounded-xl shadow-lg">
        <h1 className=" font-vt323 text-white text-lg sm:text-xl tracking-[.1em]">
          Welcome to
        </h1>

        <AnimatedCoderealm />

        {/* <img
          className="w-full max-w-xs sm:max-w-sm md:max-w-md"
          src={Frame3}
          alt="App Preview"
        /> */}

        <p
          className="  font-vt323 text-justify leading-loose text-white text-sm sm:text-base max-w-2-xl tracking-[.05em]
"
        >
          In a distant digital world - the Coderealm - the source code of the
          balance has been stolen. Without it, the realm disintegrates into
          fragments: Forums break apart, functions lose their effect, styles
          fade, bugs take over entire regions. Only the ‘Coders of the Flame’ -
          an ancient guild of developers - can restore the balance. You have
          been chosen by one of the last keepers of the code (a mystical AI?) to
          rewrite the world... line by line.{" "}
        </p>

        <h2 className="text-white text-base sm:text-lg font-semibold">
          Get started
        </h2>

        <div className="flex flex-col sm:flex-row gap-4">
          <NavLink to="login">
            <button className=" w-full bg-secondary text-black px-4 py-2 rounded hover:bg-secondaryHover transition">
              Login
            </button>
          </NavLink>
          <NavLink to="register">
            <button className="bg-secondary text-black px-4 py-2 rounded hover:bg-secondaryHover transition">
              Register
            </button>
          </NavLink>
        </div>
      </div>

      {/* We'll use the footer.jsx instead */}
      {/* <footer className="bg-primary py-4 text-center">
        <p className="text-white text-sm">Impressum</p>
      </footer> */}
    </section>
  );
};

export default LandingPage;
