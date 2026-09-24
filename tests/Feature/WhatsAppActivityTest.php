<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\Photo;
use App\Models\Project;
use App\Models\User;
use App\Models\WhatsAppLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WhatsAppActivityTest extends TestCase
{
    use RefreshDatabase;

    /**
     * inertiaProps() (from inertiajs/inertia-laravel Testing) extracts the
     * props out of the Inertia page object without needing to render the
     * app.blade.php + Vite manifest, so tests pass locally on sqlite too.
     */
    private function props(string $url, ?User $as = null): array
    {
        $test = $as ? $this->actingAs($as) : $this;
        return $test->get($url)->inertiaPage()['props'];
    }

    public function test_guest_is_bounced_to_login(): void
    {
        $this->get('/whatsapp')->assertRedirect(route('login'));
    }

    public function test_regular_user_only_sees_their_own_logs(): void
    {
        [$me, $other] = User::factory()->count(2)->create();
        WhatsAppLog::create([
            'user_id' => $me->id, 'phone_number' => '254700000001',
            'message' => 'mine', 'direction' => 'inbound', 'status' => 'received',
            'timestamp' => now(),
        ]);
        WhatsAppLog::create([
            'user_id' => $other->id, 'phone_number' => '254700000002',
            'message' => 'theirs', 'direction' => 'inbound', 'status' => 'received',
            'timestamp' => now(),
        ]);

        $props = $this->props('/whatsapp', $me);
        $this->assertCount(1, $props['items']);
        $this->assertSame('mine', $props['items'][0]['message']);
        $this->assertFalse($props['isAdmin']);
        $this->assertNull($props['settingsUrl']);
    }

    public function test_admin_sees_all_logs_and_gets_settings_link(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $other = User::factory()->create();
        WhatsAppLog::create([
            'user_id' => $other->id, 'phone_number' => '254700000003',
            'message' => 'yo', 'direction' => 'inbound', 'status' => 'received',
            'timestamp' => now(),
        ]);

        $props = $this->props('/whatsapp', $admin);
        $this->assertTrue($props['isAdmin']);
        $this->assertNotNull($props['settingsUrl']);
        $this->assertCount(1, $props['items']);
    }

    public function test_direction_filter_narrows_the_list(): void
    {
        $me = User::factory()->create();
        WhatsAppLog::create(['user_id' => $me->id, 'phone_number' => '1', 'message' => 'in', 'direction' => 'inbound', 'status' => 'received', 'timestamp' => now()]);
        WhatsAppLog::create(['user_id' => $me->id, 'phone_number' => '1', 'message' => 'out', 'direction' => 'outbound', 'status' => 'sent', 'timestamp' => now()]);

        $props = $this->props('/whatsapp?direction=inbound', $me);
        $this->assertCount(1, $props['items']);
        $this->assertSame('inbound', $props['items'][0]['direction']);
    }

    public function test_filed_lists_include_whatsapp_expenses_and_photos(): void
    {
        $me = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $me->id, 'manager_id' => $me->id]);

        Expense::create([
            'user_id' => $me->id, 'project_id' => $project->id, 'title' => 'Sent via WA',
            'amount' => 500, 'currency' => 'KES', 'expense_date' => now(),
            'category' => null, 'payment_method' => 'mobile_money',
            'source_channel' => 'whatsapp', 'status' => 'confirmed',
        ]);
        Photo::create([
            'user_id' => $me->id, 'project_id' => $project->id,
            'title' => 'WhatsApp photo — today', 'source_channel' => 'whatsapp',
            'filename' => 'a.jpg', 'original_name' => 'a.jpg', 'file_path' => 'a.jpg',
            'file_size' => 100, 'mime_type' => 'image/jpeg', 'photo_date' => now()->toDateString(),
        ]);
        Expense::create([
            'user_id' => $me->id, 'project_id' => $project->id, 'title' => 'Manual',
            'amount' => 10, 'currency' => 'KES', 'expense_date' => now(),
            'category' => 'labor', 'payment_method' => 'cash', 'status' => 'paid',
        ]);
        Photo::create([
            'user_id' => $me->id, 'project_id' => $project->id, 'title' => 'Site pic',
            'filename' => 'b.jpg', 'original_name' => 'b.jpg', 'file_path' => 'b.jpg',
            'file_size' => 100, 'mime_type' => 'image/jpeg', 'photo_date' => now()->toDateString(),
        ]);

        $filed = $this->props('/whatsapp', $me)['filed'];
        $this->assertCount(1, $filed['expenses']);
        $this->assertSame('Sent via WA', $filed['expenses'][0]['title']);
        $this->assertCount(1, $filed['photos']);
        $this->assertSame('WhatsApp photo — today', $filed['photos'][0]['title']);
    }

    public function test_photos_are_filtered_by_source_channel_not_title(): void
    {
        $me = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $me->id, 'manager_id' => $me->id]);
        // Title looks like the old WhatsApp path but source_channel is different.
        Photo::create([
            'user_id' => $me->id, 'project_id' => $project->id,
            'title' => 'WhatsApp lookalike', 'source_channel' => 'upload',
            'filename' => 'x.jpg', 'original_name' => 'x.jpg', 'file_path' => 'x.jpg',
            'file_size' => 100, 'mime_type' => 'image/jpeg', 'photo_date' => now()->toDateString(),
        ]);

        $filed = $this->props('/whatsapp', $me)['filed'];
        $this->assertCount(0, $filed['photos']);
    }

    public function test_owner_can_delete_a_log_and_its_filed_record(): void
    {
        $me = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $me->id, 'manager_id' => $me->id]);
        $expense = Expense::create([
            'user_id' => $me->id, 'project_id' => $project->id, 'title' => 'F',
            'amount' => 1, 'currency' => 'KES', 'expense_date' => now(),
            'payment_method' => 'mobile_money', 'source_channel' => 'whatsapp',
            'status' => 'confirmed',
        ]);
        $log = WhatsAppLog::create([
            'user_id' => $me->id, 'phone_number' => '2', 'message' => 'x',
            'direction' => 'inbound', 'status' => 'received',
            'filed_type' => Expense::class, 'filed_id' => $expense->id,
            'timestamp' => now(),
        ]);

        $this->actingAs($me)
            ->delete(route('whatsapp.activity.destroy', $log->id))
            ->assertRedirect();

        $this->assertDatabaseMissing('whatsapp_logs', ['id' => $log->id]);
        $this->assertDatabaseMissing('expenses', ['id' => $expense->id]);
    }

    public function test_non_owner_cannot_delete(): void
    {
        [$owner, $stranger] = User::factory()->count(2)->create();
        $log = WhatsAppLog::create([
            'user_id' => $owner->id, 'phone_number' => '3', 'message' => 'y',
            'direction' => 'inbound', 'status' => 'received', 'timestamp' => now(),
        ]);

        $this->actingAs($stranger)
            ->delete(route('whatsapp.activity.destroy', $log->id))
            ->assertForbidden();
        $this->assertDatabaseHas('whatsapp_logs', ['id' => $log->id]);
    }

    public function test_admin_can_delete_anyones_log(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $other = User::factory()->create();
        $log = WhatsAppLog::create([
            'user_id' => $other->id, 'phone_number' => '4', 'message' => 'z',
            'direction' => 'inbound', 'status' => 'received', 'timestamp' => now(),
        ]);

        $this->actingAs($admin)
            ->delete(route('whatsapp.activity.destroy', $log->id))
            ->assertRedirect();
        $this->assertDatabaseMissing('whatsapp_logs', ['id' => $log->id]);
    }

    public function test_deleting_a_log_without_filed_record_is_fine(): void
    {
        $me = User::factory()->create();
        $log = WhatsAppLog::create([
            'user_id' => $me->id, 'phone_number' => '5', 'message' => 'chit',
            'direction' => 'inbound', 'status' => 'received', 'timestamp' => now(),
        ]);

        $this->actingAs($me)
            ->delete(route('whatsapp.activity.destroy', $log->id))
            ->assertRedirect();
        $this->assertDatabaseMissing('whatsapp_logs', ['id' => $log->id]);
    }

    public function test_reclassify_updates_expense_fields(): void
    {
        $me = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $me->id, 'manager_id' => $me->id]);
        $expense = Expense::create([
            'user_id' => $me->id, 'project_id' => $project->id, 'title' => 'x',
            'amount' => 100, 'currency' => 'KES', 'expense_date' => now(),
            'payment_method' => 'mobile_money', 'payment_source' => 'paper_receipt',
            'source_channel' => 'whatsapp', 'status' => 'confirmed',
        ]);
        $log = WhatsAppLog::create([
            'user_id' => $me->id, 'phone_number' => '6', 'message' => 'ricky',
            'direction' => 'inbound', 'status' => 'received',
            'filed_type' => Expense::class, 'filed_id' => $expense->id,
            'timestamp' => now(),
        ]);

        $this->actingAs($me)
            ->post(route('whatsapp.activity.reclassify', $log->id), ['class' => 'invoice'])
            ->assertRedirect();

        $fresh = $expense->fresh();
        $this->assertSame('invoice', $fresh->payment_source);
        $this->assertSame('draft', $fresh->status);
        $this->assertSame('other', $fresh->payment_method);
    }

    public function test_reclassify_rejects_cross_type_moves(): void
    {
        $me = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $me->id, 'manager_id' => $me->id]);
        $photo = Photo::create([
            'user_id' => $me->id, 'project_id' => $project->id,
            'title' => 'WhatsApp photo — today', 'source_channel' => 'whatsapp',
            'filename' => 'p.jpg', 'original_name' => 'p.jpg', 'file_path' => 'p.jpg',
            'file_size' => 1, 'mime_type' => 'image/jpeg', 'photo_date' => now()->toDateString(),
        ]);
        $log = WhatsAppLog::create([
            'user_id' => $me->id, 'phone_number' => '7', 'message' => 'pic',
            'direction' => 'inbound', 'status' => 'received',
            'filed_type' => Photo::class, 'filed_id' => $photo->id,
            'timestamp' => now(),
        ]);

        $this->actingAs($me)
            ->from(route('whatsapp'))
            ->post(route('whatsapp.activity.reclassify', $log->id), ['class' => 'invoice'])
            ->assertSessionHasErrors('class');
    }

    public function test_reclassify_photo_updates_title_word(): void
    {
        $me = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $me->id, 'manager_id' => $me->id]);
        $photo = Photo::create([
            'user_id' => $me->id, 'project_id' => $project->id,
            'title' => 'WhatsApp photo — 24 Sep 2026', 'source_channel' => 'whatsapp',
            'filename' => 'p.jpg', 'original_name' => 'p.jpg', 'file_path' => 'p.jpg',
            'file_size' => 1, 'mime_type' => 'image/jpeg', 'photo_date' => now()->toDateString(),
        ]);
        $log = WhatsAppLog::create([
            'user_id' => $me->id, 'phone_number' => '8', 'message' => 'pic',
            'direction' => 'inbound', 'status' => 'received',
            'filed_type' => Photo::class, 'filed_id' => $photo->id,
            'timestamp' => now(),
        ]);

        $this->actingAs($me)
            ->post(route('whatsapp.activity.reclassify', $log->id), ['class' => 'progress_video'])
            ->assertRedirect();

        $this->assertSame('WhatsApp video — 24 Sep 2026', $photo->fresh()->title);
    }

    public function test_reclassify_rejects_a_stranger(): void
    {
        [$owner, $stranger] = User::factory()->count(2)->create();
        $project = Project::factory()->create(['client_id' => $owner->id, 'manager_id' => $owner->id]);
        $expense = Expense::create([
            'user_id' => $owner->id, 'project_id' => $project->id, 'title' => 'x',
            'amount' => 1, 'currency' => 'KES', 'expense_date' => now(),
            'payment_method' => 'mobile_money', 'source_channel' => 'whatsapp',
            'status' => 'confirmed',
        ]);
        $log = WhatsAppLog::create([
            'user_id' => $owner->id, 'phone_number' => '9', 'message' => 'x',
            'direction' => 'inbound', 'status' => 'received',
            'filed_type' => Expense::class, 'filed_id' => $expense->id,
            'timestamp' => now(),
        ]);

        $this->actingAs($stranger)
            ->post(route('whatsapp.activity.reclassify', $log->id), ['class' => 'invoice'])
            ->assertForbidden();
    }

    public function test_timeline_row_carries_its_filed_link(): void
    {
        $me = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $me->id, 'manager_id' => $me->id]);
        $expense = Expense::create([
            'user_id' => $me->id, 'project_id' => $project->id, 'title' => 'Filed',
            'amount' => 1200, 'currency' => 'KES', 'expense_date' => now(),
            'category' => null, 'payment_method' => 'mobile_money',
            'source_channel' => 'whatsapp', 'status' => 'confirmed',
        ]);
        WhatsAppLog::create([
            'user_id' => $me->id, 'phone_number' => '254700000004',
            'message' => 'M-Pesa receipt', 'direction' => 'inbound', 'status' => 'received',
            'filed_type' => Expense::class, 'filed_id' => $expense->id,
            'timestamp' => now(),
        ]);

        $items = $this->props('/whatsapp', $me)['items'];
        $this->assertCount(1, $items);
        $this->assertNotNull($items[0]['filed']);
        $this->assertSame('expense', $items[0]['filed']['kind']);
        $this->assertSame($expense->id, $items[0]['filed']['id']);
    }
}
