import { useEffect, useState } from 'react';

/**
 * Whether someone is signed in, from Laravel's session (sign-in itself is
 * still on the Inertia pages, which share the session cookie). Asked once
 * per page load.
 */
let asked = null;

export function useAccount() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    asked ??= fetch('/api/session', { headers: { Accept: 'application/json' }, credentials: 'same-origin' })
      .then((res) => (res.ok ? res.json() : { signed_in: false }))
      .then((data) => Boolean(data.signed_in))
      .catch(() => false);
    let live = true;
    asked.then((value) => live && setSignedIn(value));
    return () => { live = false; };
  }, []);
  return { signedIn };
}
