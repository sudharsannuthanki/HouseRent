// A single-line status banner - the simplest possible stand-in for a
// "toast" notification, matching the plain <p className="status"> pattern
// used across the app instead of a full popup/animation library.
function Toast({ message, type = "success" }) {
  if (!message) return null;
  return <p className={`status ${type}`}>{message}</p>;
}

export default Toast;
