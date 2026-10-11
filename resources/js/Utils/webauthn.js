// Small helpers around navigator.credentials. Passkey ceremonies exchange
// ArrayBuffers with the browser API, but our server speaks base64url over
// JSON — so we translate between the two here in one place.

const base64UrlToBuffer = (b64u) => {
    const padded = b64u.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (b64u.length % 4)) % 4);
    const bin = atob(padded);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes.buffer;
};

const bufferToBase64Url = (buf) => {
    const bytes = new Uint8Array(buf);
    let bin = '';
    for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const decodeCreateOptions = (options) => ({
    ...options,
    challenge: base64UrlToBuffer(options.challenge),
    user: {
        ...options.user,
        id: base64UrlToBuffer(options.user.id),
    },
    excludeCredentials: (options.excludeCredentials || []).map((c) => ({
        ...c,
        id: base64UrlToBuffer(c.id),
    })),
});

const decodeGetOptions = (options) => ({
    ...options,
    challenge: base64UrlToBuffer(options.challenge),
    allowCredentials: (options.allowCredentials || []).map((c) => ({
        ...c,
        id: base64UrlToBuffer(c.id),
    })),
});

const encodeCreateResponse = (cred) => ({
    id: cred.id,
    type: cred.type,
    rawId: bufferToBase64Url(cred.rawId),
    response: {
        clientDataJSON: bufferToBase64Url(cred.response.clientDataJSON),
        attestationObject: bufferToBase64Url(cred.response.attestationObject),
    },
    authenticatorAttachment: cred.authenticatorAttachment ?? null,
    clientExtensionResults: cred.getClientExtensionResults?.() ?? {},
});

const encodeGetResponse = (cred) => ({
    id: cred.id,
    type: cred.type,
    rawId: bufferToBase64Url(cred.rawId),
    response: {
        clientDataJSON: bufferToBase64Url(cred.response.clientDataJSON),
        authenticatorData: bufferToBase64Url(cred.response.authenticatorData),
        signature: bufferToBase64Url(cred.response.signature),
        userHandle: cred.response.userHandle ? bufferToBase64Url(cred.response.userHandle) : null,
    },
    authenticatorAttachment: cred.authenticatorAttachment ?? null,
    clientExtensionResults: cred.getClientExtensionResults?.() ?? {},
});

export const passkeySupported = () =>
    typeof window !== 'undefined'
    && typeof window.PublicKeyCredential !== 'undefined'
    && typeof navigator.credentials?.create === 'function';

export async function createPasskey(serverOptions) {
    const options = decodeCreateOptions(serverOptions);
    const cred = await navigator.credentials.create({ publicKey: options });
    if (!cred) throw new Error('Passkey creation returned null');
    return encodeCreateResponse(cred);
}

export async function assertPasskey(serverOptions) {
    const options = decodeGetOptions(serverOptions);
    const cred = await navigator.credentials.get({ publicKey: options });
    if (!cred) throw new Error('Passkey assertion returned null');
    return encodeGetResponse(cred);
}
