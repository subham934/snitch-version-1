import { useDispatch } from "react-redux";
import { setError, setLoading, setUser } from "../state/auth.slice.js";
import { register } from "../service/auth.api.js";

export function useAuth() {
    const dispatch = useDispatch();

    async function handleRegister({ email, contact, password, fullname, isSeller=false }) {
        dispatch(setLoading(true));
        dispatch(setError(null));

        try {
            const data = await register({ email, contact, password, fullname, isSeller });
            dispatch(setUser(data.user));
            return data;
        } catch (error) {
            dispatch(setError(error.response?.data?.message || 'Registration failed'));
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    }

    return {
        handleRegister,
    };
}