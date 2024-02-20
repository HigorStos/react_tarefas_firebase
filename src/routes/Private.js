import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConnection";

const Private = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    async function checkLogin() {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          const userData = {
            uid: user.uid,
            email: user.email,
          };
          localStorage.setItem("@detailUser", JSON.stringify(userData));

          setLoading(false);
          setSigned(true);
        } else {
          setLoading(false);
          setSigned(false);
        }
      });
    }

    checkLogin();
  }, []);

  if (loading) {
    return <h2>Carregando...</h2>;
  }

  if (!signed) {
    return <Navigate to="/" />;
  }

  return children;
};

export default Private;
