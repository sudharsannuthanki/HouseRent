import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../api";
import { saveAuth } from "../../auth";
import Toast from "./Toast";

const homePathByRole = { admin: "/admin", owner: "/owner", user: "/renter" };
const securityQuestions = [
  "What was your first pet's name?",
  "What city were you born in?",
  "What is your mother's maiden name?",
];

const initialForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  role: "user",
  securityQuestion: securityQuestions[0],
  securityAnswer: "",
};

function Register() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  function updateForm(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setError("");
      setIsSubmitting(true);
      const data = await registerUser(form);
      saveAuth(data.token, data.user);
      navigate(homePathByRole[data.user.role] || "/");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 440 }}>
      <div className="card">
        <h1>Create an account</h1>
        <Toast message={error} type="error" />

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Full name</label>
            <input name="name" required value={form.name} onChange={updateForm} />
          </div>
          <div className="form-row">
            <label>Email</label>
            <input type="email" name="email" required value={form.email} onChange={updateForm} />
          </div>
          <div className="form-row">
            <label>Phone (optional)</label>
            <input name="phone" value={form.phone} onChange={updateForm} />
          </div>
          <div className="form-row">
            <label>Password</label>
            <input type="password" name="password" required minLength="8" value={form.password} onChange={updateForm} />
          </div>
          <div className="form-row">
            <label>I want to join as</label>
            <select name="role" value={form.role} onChange={updateForm}>
              <option value="user">Renter / Buyer</option>
              <option value="owner">Property Owner</option>
            </select>
            <p className="hint">
              Already have an account with this email under the other role? No problem -
              you can register again here with a different password to create a separate,
              independent account for that role.
            </p>
          </div>
          <div className="form-row">
            <label>Security question</label>
            <select name="securityQuestion" value={form.securityQuestion} onChange={updateForm}>
              {securityQuestions.map((q) => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label>Your answer</label>
            <input name="securityAnswer" required value={form.securityAnswer} onChange={updateForm} />
          </div>

          <button className="btn" type="submit" disabled={isSubmitting} style={{ width: "100%" }}>
            {isSubmitting ? "Creating account..." : "Register"}
          </button>
        </form>

        <p style={{ marginTop: 14, fontSize: 13 }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
