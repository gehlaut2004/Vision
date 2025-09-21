import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Player } from "@lottiefiles/react-lottie-player";
import StudentLoginForm from "../../components/StudentLoginForm";
import OrgAuthForm from "../../components/OrgAuthForm";

// Replace these with your actual animation files
import studentAnim from "../../assets/student.json";
import officeAnim from "../../assets/office.json";

export default function Landing() {
  const [activeCard, setActiveCard] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  const handleBack = () => setActiveCard(null);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-900 overflow-hidden">
      {/* Cyberpunk background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/3 w-72 h-72 rounded-full bg-purple-500/10 blur-3xl"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-7xl px-4">
        {/* Title */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-8xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
            EXAM PORTAL
          </h1>
        </motion.div>

        {/* Cards container */}
        <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch">
          {/* Student Card */}
          <motion.div
            layout
            onHoverStart={() => !activeCard && setHoveredCard("student")}
            onHoverEnd={() => setHoveredCard(null)}
            transition={{
              layout: { duration: 0.6, type: "spring" },
              hover: { duration: 0.3 },
            }}
            animate={{
              flex: activeCard === null ? 1 : activeCard === "student" ? 3 : 0,
              opacity: activeCard === null || activeCard === "student" ? 1 : 0,
              scale:
                activeCard === "student"
                  ? 1.05
                  : hoveredCard === "student"
                  ? 1.03
                  : 1,
              borderColor:
                hoveredCard === "student"
                  ? "rgba(0, 255, 255, 0.7)"
                  : "rgba(255, 0, 255, 0.3)",
              boxShadow:
                hoveredCard === "student"
                  ? "0 0 30px rgba(0, 255, 255, 0.5)"
                  : activeCard === "student"
                  ? "0 0 40px rgba(0, 255, 255, 0.7)"
                  : "0 0 20px rgba(255, 0, 255, 0.3)",
            }}
            className={`relative rounded-xl border-2 bg-gray-900/80 backdrop-blur-lg p-6 overflow-hidden ${
              activeCard === "student"
                ? "min-h-[500px]"
                : "cursor-pointer h-[300px]"
            }`}
            onClick={() => !activeCard && setActiveCard("student")}
          >
            {/* Card content */}
            <div
              className={`flex flex-col items-center text-center ${
                activeCard === "student" ? "h-auto" : "h-full"
              }`}
            >
              {/* Back button at the top */}
              <AnimatePresence>
                {activeCard === "student" && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="self-start mb-4"
                  >
                    <motion.button
                      onClick={handleBack}
                      className="text-lg text-cyan-300 hover:text-white cursor-pointer flex items-center gap-1 font-mono"
                      whileHover={{ x: -4 }}
                    >
                      <span className="text-2xl">←</span> BACK TO SELECTION
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mb-6">
                <Player
                  autoplay
                  loop
                  src={studentAnim}
                  style={{ height: 120 }}
                  speed={hoveredCard === "student" ? 1.5 : 1}
                />
              </div>

              <motion.h2
                className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-cyan-200"
                animate={{
                  textShadow:
                    hoveredCard === "student"
                      ? "0 0 15px rgba(0, 255, 255, 0.7)"
                      : "0 0 8px rgba(0, 255, 255, 0.3)",
                }}
              >
                STUDENT LOGIN
              </motion.h2>

              <motion.p
                className="text-cyan-200/80 mb-6 font-mono"
                animate={{
                  opacity: hoveredCard === "student" ? 1 : 0.7,
                }}
              >
                &gt;_ Access your exams
              </motion.p>

              {/* Form appears when card is active */}
              <AnimatePresence>
                {activeCard === "student" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.4 }}
                    className="w-full mt-4"
                  >
                    <StudentLoginForm />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Divider */}
          {!activeCard && (
            <motion.div
              className="hidden md:flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="relative h-64 w-1 mx-4">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500 to-transparent"></div>
                <motion.div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-purple-300 font-mono px-3 py-1 bg-gray-900 rounded-full border border-purple-500/50"
                  animate={{
                    scale: [1, 1.1, 1],
                    textShadow: [
                      "0 0 5px rgba(255, 0, 255, 0.5)",
                      "0 0 10px rgba(255, 0, 255, 0.8)",
                      "0 0 5px rgba(255, 0, 255, 0.5)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  OR
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Organization Card */}
          <motion.div
            layout
            onHoverStart={() => !activeCard && setHoveredCard("org")}
            onHoverEnd={() => setHoveredCard(null)}
            transition={{
              layout: { duration: 0.6, type: "spring" },
              hover: { duration: 0.3 },
            }}
            animate={{
              flex: activeCard === null ? 1 : activeCard === "org" ? 3 : 0,
              opacity: activeCard === null || activeCard === "org" ? 1 : 0,
              scale:
                activeCard === "org" ? 1.05 : hoveredCard === "org" ? 1.03 : 1,
              borderColor:
                hoveredCard === "org"
                  ? "rgba(255, 0, 255, 0.7)"
                  : "rgba(0, 255, 255, 0.3)",
              boxShadow:
                hoveredCard === "org"
                  ? "0 0 30px rgba(255, 0, 255, 0.5)"
                  : activeCard === "org"
                  ? "0 0 40px rgba(255, 0, 255, 0.7)"
                  : "0 0 20px rgba(0, 255, 255, 0.3)",
            }}
            className={`relative rounded-xl border-2 bg-gray-900/80 backdrop-blur-lg p-6 overflow-hidden ${
              activeCard === "org"
                ? "min-h-[500px]"
                : "cursor-pointer h-[300px]"
            }`}
            onClick={() => !activeCard && setActiveCard("org")}
          >
            {/* Card content */}
            <div
              className={`flex flex-col items-center text-center ${
                activeCard === "org" ? "h-auto" : "h-full"
              }`}
            >
              {/* Back button at the top */}
              <AnimatePresence>
                {activeCard === "org" && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="self-start mb-4"
                  >
                    <motion.button
                      onClick={handleBack}
                      className="text-lg text-purple-300 hover:text-white cursor-pointer flex items-center gap-1 font-mono"
                      whileHover={{ x: -4 }}
                    >
                      <span className="text-2xl">←</span> BACK TO SELECTION
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mb-6">
                <Player
                  autoplay
                  loop
                  src={officeAnim}
                  style={{ height: 120 }}
                  speed={hoveredCard === "org" ? 1.5 : 1}
                />
              </div>

              <motion.h2
                className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-200"
                animate={{
                  textShadow:
                    hoveredCard === "org"
                      ? "0 0 15px rgba(255, 0, 255, 0.7)"
                      : "0 0 8px rgba(255, 0, 255, 0.3)",
                }}
              >
                ADMIN PORTAL
              </motion.h2>

              <motion.p
                className="text-purple-200/80 mb-6 font-mono"
                animate={{
                  opacity: hoveredCard === "org" ? 1 : 0.7,
                }}
              >
                &gt;_ Manage exams
              </motion.p>

              {/* Form appears when card is active */}
              <AnimatePresence>
                {activeCard === "org" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.4 }}
                    className="w-full mt-4"
                  >
                    <OrgAuthForm />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}