import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/router';
import { createContext, useContext, useEffect, useState } from 'react';

const Context = createContext();

const Provider = ({ children }) => {
	const [user, setUser] = useState(supabase.auth.getUser());
	const router = useRouter();

	useEffect(() => {
		const getUserProfile = async () => {
			const sessionUser = await supabase.auth.getUser();

			if (sessionUser.data.user) {
				const { data: profile } = await supabase
					.from('profil')
					.select('*')
					.eq('id', sessionUser.data.user.id)
					.single();

				setUser({
					...sessionUser.data.user,
					...profile,
				});
			}
		};

		getUserProfile();

		supabase.auth.onAuthStateChange(async () => {
			getUserProfile();
		});
	}, []);

	const login = async (input) => {
		const { error } = await supabase.auth.signInWithPassword({
			email: input.email,
			password: input.pass,
		});
		if (!error) {
			router.push('/');
		} else {
			return error;
		}
	};

	const logout = async () => {
		await supabase.auth.signOut();
		setUser(null);
		router.push('/auth/prihlasit');
	};

	const register = async (input) => {
		const { error } = await supabase.auth.signUp({
			email: input.email,
			password: input.pass,
		});
		if (!error) {
			router.push('/');
		} else {
			return error;
		}
	};

	const exposed = {
		user,
		login,
		logout,
		register,
	};

	return <Context.Provider value={exposed}>{children}</Context.Provider>;
};

export const useUser = () => useContext(Context);

export default Provider;
