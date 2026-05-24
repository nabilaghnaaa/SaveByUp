import { useNavigate } from "react-router-dom";

import AuthLayout from "../components/AuthLayout";

import RegisterBrand from "./components/RegisterBrand";
import RegisterForm from "./components/RegisterForm";
import RegisterVisual from "./components/RegisterVisual";

import "./styles/register.css";

export default function Register() {
  const navigate = useNavigate();

  return (
    <AuthLayout variant="register" visual={<RegisterVisual />}>
      <RegisterBrand />

      <RegisterForm
        onSuccess={() => {
          navigate("/login", { replace: true });
        }}
      />
    </AuthLayout>
  );
}