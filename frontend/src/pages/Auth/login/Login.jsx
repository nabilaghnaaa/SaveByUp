import { useNavigate } from "react-router-dom";

import AuthLayout from "../components/AuthLayout";

import LoginBrand from "./components/LoginBrand";
import LoginForm from "./components/LoginForm";
import LoginVisual from "./components/LoginVisual";

import "./styles/login.css";

export default function Login() {
  const navigate = useNavigate();

  return (
    <AuthLayout variant="login" visual={<LoginVisual />}>
      <LoginBrand />

      <LoginForm
        onSuccess={() => {
          navigate("/dashboard", { replace: true });
        }}
      />
    </AuthLayout>
  );
}