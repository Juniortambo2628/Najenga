<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\OcrService;
use App\Services\ReceiptProcessingService;
use Illuminate\Http\Request;
use Telegram\Bot\Laravel\Facades\Telegram;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class TelegramController extends Controller
{
    public function __construct(
        protected OcrService $ocr,
        protected ReceiptProcessingService $receiptService,
    ) {
    }
    public function handleWebhook(Request $request)
    {
        try {
            $update = Telegram::commandsHandler(true);
            $message = $update->getMessage();
            
            if (!$message) {
                return response()->json(['status' => 'no_message']);
            }

            $chatId = $message->getChat()->getId();
            $text = $message->getText();
            $photo = $message->getPhoto();

            // 1. Authenticate / Link User
            $user = User::where('telegram_chat_id', $chatId)->first();

            // Handle /start command to link account
            if ($text === '/start') {
                 if ($user) {
                     Telegram::sendMessage([
                        'chat_id' => $chatId,
                        'text' => "Welcome back, {$user->first_name}! Send me a receipt photo to track an expense."
                    ]);
                 } else {
                     Telegram::sendMessage([
                        'chat_id' => $chatId,
                        // Simplification for prototype: Ask user to enter their email to link
                        // Ideally, we'd use a unique token system, but email matching is faster for this demo
                        'text' => "Welcome to Najenga! To link your account, please reply with your registered email address."
                    ]);
                 }
                 return response()->json(['status' => 'handled_start']);
            }

            // Handle Email Linking logic (if not linked)
            if (!$user && filter_var($text, FILTER_VALIDATE_EMAIL)) {
                $user = User::where('email', $text)->first();
                if ($user) {
                    $user->telegram_chat_id = $chatId;
                    $user->save();
                    Telegram::sendMessage([
                        'chat_id' => $chatId,
                        'text' => "Account linked successfully! Hi {$user->first_name}, you can now send me photos of your receipts."
                    ]);
                } else {
                    Telegram::sendMessage([
                        'chat_id' => $chatId,
                        'text' => "I couldn't find an account with that email. Please check your spelling or sign up on the website first."
                    ]);
                }
                return response()->json(['status' => 'handled_linking']);
            }

            if (!$user) {
                 Telegram::sendMessage([
                    'chat_id' => $chatId,
                    'text' => "Please verify your account first by sending your email address."
                ]);
                return response()->json(['status' => 'unauthenticated']);
            }

            // 2. Handle Photo (Receipt)
            if ($photo) {
                // Get the largest photo (last in array)
                $fileId = end($photo)->getFileId();
                $file = Telegram::getFile(['file_id' => $fileId]);
                $webPath = 'https://api.telegram.org/file/bot' . config('services.telegram.bot_token', '') . '/' . $file->getFilePath();
                
                $this->processReceipt($webPath, $user, $chatId);
                return response()->json(['status' => 'processed_photo']);
            } else {
                Telegram::sendMessage([
                    'chat_id' => $chatId,
                    'text' => "I only understand photos right now. Please send a picture of a receipt."
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Telegram Webhook Error: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => $e->getMessage()]);
        }

        return response()->json(['status' => 'success']);
    }

    private function processReceipt($url, $user, $chatId)
    {
        Telegram::sendMessage([
            'chat_id' => $chatId,
            'text' => "Receipt received! Analyzing..."
        ]);

        try {
            $expense = $this->receiptService->processReceiptFromUrl($url, $user);

            if (!$expense) {
                throw new \Exception("OCR or expense creation failed");
            }

            $msg = "✅ Expense Saved!\n";
            $msg .= "Merchant: " . ($expense->title ?? 'Unknown') . "\n";
            $msg .= "Total: KES " . number_format($expense->amount ?? 0, 2) . "\n";
            $msg .= "Date: " . ($expense->expense_date?->format('Y-m-d') ?? 'Today');

            Telegram::sendMessage([
                'chat_id' => $chatId,
                'text' => $msg
            ]);

        } catch (\Exception $e) {
            Log::error("Receipt Processing Error: " . $e->getMessage());
            Telegram::sendMessage([
                'chat_id' => $chatId,
                'text' => "Sorry, I couldn't read that receipt. Please try checking the lighting and focus."
            ]);
        }
    }
}
