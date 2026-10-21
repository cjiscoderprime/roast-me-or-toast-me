import {useState} from 'react'
import {motion, AnimatePresence} from 'motion/react'
import "./App.css"
import AnimatedBackground from "./components/AnimatedBackground";

function App(){
  const [context, setContext] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeMode, setActiveMode] = useState(null);
  const [error, setError] = useState("");

  async function generateMessage(mode) {
    if (!context.trim() || loading) return;

    setActiveMode(mode);
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        "/api/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          }, 
          body: JSON.stringify({
            context, 
            mode,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to generate a response."
        );
      }

      setMessage(data.joke);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
    <AnimatedBackground />

    <main className = "container">
    <h1 className = "brand-title"> Roast Me{" "} <span className = "brand-highlight">or Toast Me </span></h1>
      <p className = "subtitle">
        Tell me what happened. We're in this together.
      </p>

      <textarea
        placeholder =  "Anything you can't process alone? Need a quick laugh/relief or someone to cheer you on? I got you."

        value = {context}
        onChange = {(e) => setContext(e.target.value)}
        maxLength = {1500}
        rows = {5}
      />

      <div className = "buttons">
        <motion.button
        className = "roast-button"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: "spring", stiffness: 350 }}
        disabled={loading || !context.trim()}
        onClick={() => generateMessage("roast")}
        >
          Roast Me
        </motion.button>

        <motion.button
        className = "toast-button"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: "spring", stiffness: 350 }}
        disabled={loading || !context.trim()}
        onClick={() => generateMessage("toast")}
        >
          Toast Me
        </motion.button>
      </div>

   
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="loading"
            role="status"
          >
            <motion.div
              className={`loading-orb ${activeMode === "toast" ? "toast-orb" : ""}`}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.3,
                repeat: Infinity
              }}
            />
            <p>{ activeMode === "roast"
            ? "Emotional Damage in progress"
            : "Heal and get that smile up..."}</p>
          </motion.div>
        ) : message ? (
          <motion.div
            key="message"
            className="message-box"
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 18
            }}
          >
            <p>{message}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {error && (
        <p role="alert" className="error">{error}</p>
      )}
    </main>
    </>
  );
}

export default App;
  