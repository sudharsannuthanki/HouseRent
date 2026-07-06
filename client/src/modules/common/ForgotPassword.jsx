import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getSecurityQuestion, resetPassword } from "../../api";
import Toast from "./Toast";

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleVerify(event) {
    event.preventDefault();
    try {
      setError("");
      setIsSubmitting(true);
      const data = await getSecurityQuestion(email, role);
      setSecurityQuestion(data.securityQuestion);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReset(event) {
    event.preventDefault();
    try {
      setError("");
      setIsSubmitting(true);
      await resetPassword({ email, role, securityAnswer, newPassword });
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 400 }}>
      <div className="card">
        <h1>Reset password</h1>
        <Toast message={error} type="error" />

        {step === 1 ? (
          <form onSubmit={handleVerify}>
            <div className="form-row">
              <label>Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-row">
              <label>Which account?</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="user">Renter / Buyer</option>
                <option value="owner">Property Owner</option>
              </select>
              <p className="hint">
                Since the same email can have both a Renter/Buyer and an Owner account,
                let us know which one you're resetting.
              </p>
            </div>
            <button className="btn" type="submit" disabled={isSubmitting} style={{ width: "100%" }}>
              {isSubmitting ? "Checking..." : "Continue"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset}>
            <div className="form-row">
              <label>{securityQuestion}</label>
              <input required value={securityAnswer} onChange={(e) => setSecurityAnswer(e.target.value)} />
            </div>
            <div className="form-row">
              <label>New password</label>
              <input type="password" required minLength="8" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <button className="btn" type="submit" disabled={isSubmitting} style={{ width: "100%" }}>
              {isSubmitting ? "Resetting..." : "Reset password"}
            </button>
          </form>
        )}

        <p style={{ marginTop: 14, fontSize: 13 }}>
          <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
