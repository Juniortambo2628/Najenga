<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Passkey;
use App\Services\PasskeyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/**
 * Registration + management of the signed-in user's passkeys. Login is in
 * PasskeyAuthenticationController.
 */
class PasskeyController extends Controller
{
    public function __construct(private readonly PasskeyService $passkeys)
    {
    }

    public function options(Request $request): JsonResponse
    {
        $user = $request->user();
        $options = $this->passkeys->creationOptionsFor($user);
        $json = $this->passkeys->serializeCreationOptions($options);
        $request->session()->put('passkey.register_options', $json);

        return response()->json($this->passkeys->optionsAsArray($json));
    }

    public function register(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'response' => ['required', 'array'],
        ]);

        $json = $request->session()->pull('passkey.register_options');
        if (! $json) {
            throw ValidationException::withMessages([
                'response' => __('Start the passkey setup again.'),
            ]);
        }

        try {
            $options = $this->passkeys->deserializeCreationOptions($json);
            $this->passkeys->verifyAttestationAndSave(
                $request->user(),
                $data['name'],
                $data['response'],
                $options,
            );
        } catch (\Throwable $e) {
            throw ValidationException::withMessages([
                'response' => __('That passkey could not be verified: :msg', ['msg' => $e->getMessage()]),
            ]);
        }

        return back();
    }

    public function destroy(Request $request, Passkey $passkey): RedirectResponse
    {
        abort_unless($passkey->user_id === $request->user()->id, 403);
        $passkey->delete();

        return back();
    }
}
