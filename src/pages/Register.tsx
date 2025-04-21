
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login page since we only use Twitch authentication
    navigate("/login");
  }, [navigate]);

  return null; // The component will redirect immediately
};

export default Register;
