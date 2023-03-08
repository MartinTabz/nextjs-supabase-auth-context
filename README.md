# NextJS User Context

### ./context/uzivatel.js

```javascript
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

      // Přidá data, která přihlášenému uživateli patří z tabulky profilů
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
```

### ./pages/_app.js

```javascript
import Provider from '@/context/uzivatel';
import '@/styles/globals.css';

export default function App({ Component, pageProps }) {
	return (
		<Provider>
			<Component {...pageProps} />
		</Provider>
	);
}
```

### Zobrazování uživatele

```javascript
import { useUser } from '@/context/uzivatel.js';

export default function Stranka() {
  const { user } = useUser();

  return <h1>user.email</h1>;
}
```

### Odhlášení uživatele

```javascript
import { useUser } from '@/context/uzivatel.js';

export default function Odhlasit() {
  const { logout } = useUser();

  return <button onClick={() => logout()}>user.email</button>;
}
```

### Přihlášení + registrace uživatele

```javascript
import { useUser } from '@/context/user';
import { useState } from 'react';

export default function Prihlasit() {
	const { login, register } = useUser();
  
	const [mailValue, setMailValue] = useState('');
	const [passValue, setPassValue] = useState('');

	const handleSubmit = async (e) => {
		e.preventDefault();
    const data = {
      email: mailValue,
      pass: passValue,
    };
    login(data);
    // register(data)
	};

	return (
    <form onSubmit={handleSubmit}>
      <input
        value={mailValue}
        onChange={(e) => setMailValue(e.target.value)}
        type="email"
        placeholder="Váš e-mail"
      />
      <input
        value={passValue}
        onChange={(e) => setPassValue(e.target.value)}
        type="password"
        placeholder="Heslo"
      />
      <button type="submit">Registrovat</button>
    </form>
	);
}
```
