<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\Photo;
use App\Models\Project;
use App\Models\User;
use App\Models\WhatsAppLog;
use App\Notifications\WhatsAppWeeklyDigest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class WhatsAppWeeklyDigestTest extends TestCase
{
    use RefreshDatabase;

    public function test_users_without_activity_this_week_get_nothing(): void
    {
        Notification::fake();
        User::factory()->create();

        $this->artisan('whatsapp:send-weekly-digest')->assertSuccessful();

        Notification::assertNothingSent();
    }

    public function test_users_with_recent_activity_receive_a_digest(): void
    {
        Notification::fake();
        $user = User::factory()->create();
        WhatsAppLog::create([
            'user_id' => $user->id,
            'phone_number' => '254700000000',
            'message' => 'M-Pesa',
            'direction' => 'inbound',
            'status' => 'received',
            'timestamp' => now()->subDay(),
        ]);

        $this->artisan('whatsapp:send-weekly-digest')->assertSuccessful();

        Notification::assertSentTo($user, WhatsAppWeeklyDigest::class);
    }

    public function test_digest_stats_count_filed_expenses_drafts_and_photos(): void
    {
        Notification::fake();
        $user = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $user->id, 'manager_id' => $user->id]);

        WhatsAppLog::create([
            'user_id' => $user->id, 'phone_number' => '1', 'message' => 'a',
            'direction' => 'inbound', 'status' => 'received', 'timestamp' => now()->subDays(2),
        ]);
        WhatsAppLog::create([
            'user_id' => $user->id, 'phone_number' => '1', 'message' => 'b',
            'direction' => 'inbound', 'status' => 'received', 'timestamp' => now()->subDays(3),
        ]);
        Expense::create([
            'user_id' => $user->id, 'project_id' => $project->id, 'title' => 'x',
            'amount' => 100, 'currency' => 'KES', 'expense_date' => now(),
            'payment_method' => 'mobile_money', 'source_channel' => 'whatsapp',
            'status' => 'confirmed', 'created_at' => now()->subDay(),
        ]);
        Expense::create([
            'user_id' => $user->id, 'project_id' => $project->id, 'title' => 'y',
            'amount' => 200, 'currency' => 'KES', 'expense_date' => now(),
            'payment_method' => 'other', 'source_channel' => 'whatsapp',
            'status' => 'draft', 'created_at' => now()->subDay(),
        ]);
        Photo::create([
            'user_id' => $user->id, 'project_id' => $project->id,
            'title' => 'WhatsApp photo — today', 'source_channel' => 'whatsapp',
            'filename' => 'p.jpg', 'original_name' => 'p.jpg', 'file_path' => 'p.jpg',
            'file_size' => 1, 'mime_type' => 'image/jpeg', 'photo_date' => now()->toDateString(),
        ]);

        $this->artisan('whatsapp:send-weekly-digest')->assertSuccessful();

        Notification::assertSentTo($user, WhatsAppWeeklyDigest::class, function ($notif) use ($project) {
            $r = new \ReflectionClass($notif);
            $stats = $r->getProperty('stats')->getValue($notif);
            return $stats['inbound'] === 2
                && $stats['filed_expenses'] === 1
                && $stats['drafts'] === 1
                && $stats['photos'] === 1
                && $stats['top_project'] === $project->name;
        });
    }

    public function test_activity_older_than_a_week_is_ignored(): void
    {
        Notification::fake();
        $user = User::factory()->create();
        WhatsAppLog::create([
            'user_id' => $user->id, 'phone_number' => '1', 'message' => 'old',
            'direction' => 'inbound', 'status' => 'received',
            'timestamp' => now()->subDays(10),
        ]);

        $this->artisan('whatsapp:send-weekly-digest')->assertSuccessful();

        Notification::assertNothingSent();
    }
}
