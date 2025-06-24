import React from "react";
import { NavLink } from "react-router-dom";
import AnimatedCoderealm from "./AnimatedCoderealm";
import JadaWireframe from "../Jada/JadaWireframe";

const LandingPage = () => {
  return (
    <section className="relative bg-background min-h-screen overflow-hidden">
      <JadaWireframe />

      <div className="gradient-border-bottom relative z-10 p-6 sm:p-8 md:p-12 lg:p-40 flex flex-col justify-evenly items-center w-[90%] sm:w-11/12 md:w-4/5 gap-8 mr-auto rounded-xl shadow-lg">
        <h1 className=" font-vt323 text-white text-lg sm:text-xl tracking-[.1em]">
          {/* Welcome to */}
        </h1>

        <AnimatedCoderealm />

        <p className="font-vt323 text-justify leading-loose text-white text-base sm:text-xl max-w-2-xl tracking-[.05em]">
          The Coderealm is breaking — files fracturing, logic loops collapsing,
          styles erased. <br />JADA, the realm’s guardian, is glitching. <br />Her memory is
          fragmented. Her form unstable. <br />You weren’t just summoned to witness
          the collapse. <br />You’re here to restore her — line by line.
        </p>

        <h2 className="text-white text-base sm:text-lg font-thin">
          "She knows you. Somewhere inside the glitch — she remembers"
        </h2>

        <div className="relative -bottom-20 mt-auto flex flex-col sm:flex-row gap-4">
          <NavLink to="login">
            <button className="jada-button w-full transition">
              Login
            </button>
          </NavLink>
          <NavLink to="register">
            <button className="jada-button w-full transition">
              Register
            </button>
          </NavLink>
        </div>
      </div>
    </section>
  );
};

export default LandingPage;
