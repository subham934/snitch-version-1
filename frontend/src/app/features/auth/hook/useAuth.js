import { useDispatch } from "react-redux";
import { setError, setLoading, setUser } from "../state/auth.slice.js";
import { getMe, login, register, logout } from "../service/auth.api.js";

export function useAuth() {
    const dispatch = useDispatch();

    async function handleRegister({ email, contact, password, fullname, isSeller=false }) {
        dispatch(setLoading(true));
        dispatch(setError(null));

        try {
            const data = await register({ email, contact, password, fullname, isSeller });
            dispatch(setUser(data.user));
            return data.user;
        } catch (error) {
            dispatch(setError(error.response?.data?.message || 'Registration failed'));
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleLogin({email, password}){
        dispatch(setLoading(true));
        dispatch(setError(null));

        try {
            const data = await login({ email, password });
            dispatch(setUser(data.user));
            return data.user;
        } catch (error) {
            dispatch(setError(error.response?.data?.message || 'Login failed'));
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleGetMe() {
      dispatch(setLoading(true));
      dispatch(setError(null));

      try {
        const data = await getMe();
        dispatch(setUser(data.user));
        return data;
      } catch (error) {
        // If no token / session expired, it's expected — don't show error to user
        dispatch(setUser(null));
      } finally {
        dispatch(setLoading(false));
      }
    }

    async function handleLogout() {
      dispatch(setLoading(true));
      try {
        await logout();
        dispatch(setUser(null));
      } catch (error) {
        console.error("Logout failed", error);
      } finally {
        dispatch(setLoading(false));
      }
    }
    

    return {
        handleRegister,
        handleLogin,
        handleGetMe,
        handleLogout
    };
}