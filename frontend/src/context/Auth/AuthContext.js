import React, { createContext, useMemo } from "react";

import useAuth from "../../hooks/useAuth.js/index.js";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
	const { loading, user, isAuth, handleLogin, handleLogout, socket } = useAuth();

	const contextValue = useMemo(() => ({
		loading, user, isAuth, handleLogin, handleLogout, socket
	}), [loading, user, isAuth, handleLogin, handleLogout, socket]);

	return (
		<AuthContext.Provider value={contextValue}>
			{children}
		</AuthContext.Provider>
	);
};

export { AuthContext, AuthProvider };