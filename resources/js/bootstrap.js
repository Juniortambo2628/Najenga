import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;

// Laravel keeps the current CSRF token in the XSRF-TOKEN cookie, encrypted.
// It decrypts X-XSRF-TOKEN before comparing, but NOT X-CSRF-TOKEN — that
// header must carry the plain token from the <meta> tag. Sending the
// encrypted cookie value in X-CSRF-TOKEN is a guaranteed mismatch and
// returns 419 on every POST. So: seed X-CSRF-TOKEN once from the meta tag,
// and per-request set only X-XSRF-TOKEN from the freshest cookie so long-
// idle sessions and post-login rotations still submit cleanly.
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
    }
    return config;
});
