import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;

// Read the freshest CSRF token per request from the XSRF-TOKEN cookie Laravel
// keeps in sync. Falling back to the meta tag from the initial page load only
// covers the first request — after Laravel rotates the token (e.g. after login
// or a long-idle session), the stale meta value returns 419 Page Expired on
// POSTs like logout.
function readXsrfCookie() {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}

const metaToken = document.head.querySelector('meta[name="csrf-token"]');
if (metaToken) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = metaToken.content;
}

window.axios.interceptors.request.use((config) => {
    const fresh = readXsrfCookie();
    if (fresh) {
        config.headers['X-XSRF-TOKEN'] = fresh;
        config.headers['X-CSRF-TOKEN'] = fresh;
    }
    return config;
});
