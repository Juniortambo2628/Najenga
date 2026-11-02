<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\Document;
use App\Models\Folder;
use App\Models\Photo;
use App\Models\Project;
use App\Models\ProjectTimeline;
use App\Models\Receipt;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * VisualTestSeeder's project with something on every page: milestones,
 * folders and documents, photos, a second person and a comment. For
 * before/after screenshots of the dashboard while it moves to the OKJT kit.
 *
 *   php artisan migrate:fresh --seed --seeder=DashboardPreviewSeeder
 */
class DashboardPreviewSeeder extends Seeder
{
    /** twofactor@example.com's authenticator secret (base32), for scripted sign-ins. */
    public const TWO_FACTOR_SECRET = 'JBSWY3DPEHPK3PXP';

    public function run(): void
    {
        $this->call(VisualTestSeeder::class);

        $owner = User::where('email', VisualTestSeeder::EMAIL)->firstOrFail();
        $project = Project::firstOrFail();

        // A superadmin, so Users and the admin pages show too.
        $owner->forceFill(['is_superadmin' => true])->save();

        $editor = (new User)->forceFill([
            'username' => 'otieno',
            'email' => 'otieno@example.com',
            'password' => Hash::make('password'),
            'first_name' => 'Brian',
            'last_name' => 'Otieno',
            'role' => 'client',
            'status' => 'active',
            'email_verified_at' => '2025-01-01 08:00:00',
            'created_at' => '2025-01-01 08:00:00',
        ]);
        $editor->save();
        $project->users()->syncWithoutDetaching([$editor->id => ['role' => 'editor']]);

        // For the sign-in pages: someone who hasn't verified their email,
        // and someone with two-factor sign-in (secret printed by the test helper).
        (new User)->forceFill([
            'username' => 'newcomer', 'email' => 'unverified@example.com', 'password' => Hash::make('password'),
            'first_name' => 'Amina', 'last_name' => 'Wanjiru', 'role' => 'client', 'status' => 'active',
            'created_at' => '2025-01-01 08:00:00',
        ])->save();
        (new User)->forceFill([
            'username' => 'secure', 'email' => 'twofactor@example.com', 'password' => Hash::make('password'),
            'first_name' => 'Kamau', 'last_name' => 'Njoroge', 'role' => 'client', 'status' => 'active',
            'email_verified_at' => '2025-01-01 08:00:00', 'created_at' => '2025-01-01 08:00:00',
            // Encrypted as Fortify stored them (okjt.auth.two_factor.secrets_encrypted; the model's cast encrypts again).
            'two_factor_secret' => encrypt(self::TWO_FACTOR_SECRET),
            'two_factor_recovery_codes' => encrypt(json_encode(['recovery-code-1'])),
            'two_factor_confirmed_at' => '2025-01-01 08:00:00',
        ])->save();

        $milestones = [
            ['Foundation', 'Excavation, footing and slab.', '2026-03-02', '2026-04-15', 'completed', 'high'],
            ['Walling', 'Machine-cut stone to ring beam.', '2026-04-16', '2026-07-10', 'completed', 'high'],
            ['Roofing', 'Trusses, mabati and gutters.', '2026-07-11', '2026-09-30', 'in_progress', 'critical'],
            ['Finishes', 'Plaster, tiling, paint and fittings.', '2026-10-01', '2026-12-18', 'pending', 'medium'],
        ];
        foreach ($milestones as [$title, $description, $start, $end, $status, $priority]) {
            ProjectTimeline::create(['project_id' => $project->id, 'title' => $title, 'description' => $description, 'start_date' => $start, 'end_date' => $end, 'status' => $status, 'priority' => $priority]);
        }

        $plans = Folder::create(['name' => 'Plans', 'project_id' => $project->id]);
        Folder::create(['name' => 'Permits', 'project_id' => $project->id]);
        foreach ([['Floor plan', 'floor-plan.pdf', 'drawings', '2026-02-10'], ['Contract with Otieno & Co.', 'contract.pdf', 'contracts', '2026-02-20']] as [$title, $file, $category, $date]) {
            (new Document)->forceFill([
                'project_id' => $project->id,
                'user_id' => $owner->id,
                'folder_id' => $title === 'Floor plan' ? $plans->id : null,
                'filename' => $file,
                'original_name' => $file,
                'file_path' => "documents/{$file}",
                'file_size' => 245760,
                'mime_type' => 'application/pdf',
                'title' => $title,
                'category' => $category,
                'document_date' => $date,
            ])->save();
        }

        foreach (['pexels-d-goug-211350543-38210397.webp' => 'Ring beam poured', 'pexels-clement-proust-363898785-31763541.webp' => 'Roof tiles delivered'] as $file => $title) {
            $photo = (new Photo)->forceFill([
                'project_id' => $project->id,
                'user_id' => $owner->id,
                'filename' => $file,
                'original_name' => $file,
                'file_path' => "photos/{$file}",
                'file_size' => 200000,
                'mime_type' => 'image/webp',
                'title' => $title,
                'category' => 'progress',
                'taken_at' => '2026-09-20 11:00:00',
                'date_source' => 'exif',
            ]);
            $photo->save();
            $source = public_path("Najenga-backgrounds/{$file}");
            if (is_file($source)) {
                rescue(fn () => $photo->addMedia($source)->preservingOriginal()->toMediaCollection('photos'), report: false);
            }
        }

        $expense = $project->expenses()->first();
        if ($expense) {
            Comment::create(['body' => 'Receipt is in the WhatsApp chat — I’ll attach it tonight.', 'user_id' => $editor->id, 'commentable_id' => $expense->id, 'commentable_type' => $expense::class]);

            // A receipt read by OCR, for the Receipts pages.
            (new Receipt)->forceFill([
                'expense_id' => $expense->id,
                'filename' => 'bamburi-receipt.jpg',
                'original_name' => 'bamburi-receipt.jpg',
                'file_path' => 'receipts/bamburi-receipt.jpg',
                'file_size' => 120000,
                'mime_type' => 'image/jpeg',
                'extracted_text' => "BAMBURI HARDWARE\nCEMENT 40 BAGS\nTOTAL KES 32,000",
                'extracted_amount' => 32000,
                'extracted_date' => '2026-10-20',
                'extracted_merchant' => 'Bamburi Hardware',
                'ocr_provider' => 'tesseract',
                'processed_at' => '2026-10-20 11:00:00',
            ])->save();
        }
    }
}
