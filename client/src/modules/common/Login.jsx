import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../api";
import { saveAuth } from "../../auth";
import Toast from "./Toast";

const homePathByRole = { admin: "/admin", owner: "/owner", user: "/renter" };

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
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
      const data = await loginUser(form);
      saveAuth(data.token, data.user);
      navigate(homePathByRole[data.user.role] || "/");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 400 }}>
      <div className="card">
        <h1>Login</h1>
        <Toast message={error} type="error" />

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Email</label>
            <input type="email" name="email" required value={form.email} onChange={updateForm} />
          </div>
          <div className="form-row">
            <label>Password</label>
            <input type="password" name="password" required value={form.password} onChange={updateForm} />
          </div>
          <button className="btn" type="submit" disabled={isSubmitting} style={{ width: "100%" }}>
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="hint" style={{ marginTop: 12 }}>
          Have both a Renter/Buyer and an Owner account on this email? Just enter the
          password for the one you want - we'll figure out which account it belongs to.
        </p>

        <p style={{ marginTop: 14, fontSize: 13 }}>
          <Link to="/forgot-password">Forgot password?</Link> &middot; <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
