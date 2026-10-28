<?php

namespace Database\Seeders;

use App\Models\Expense;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Fixed data for the visual regression tests (tests/visual): the same
 * names, amounts and dates on every run, so screenshots only change when
 * the interface does. No model events: no version history, no badges.
 */
class VisualTestSeeder extends Seeder
{
    use WithoutModelEvents;

    public const EMAIL = 'visual@example.com';

    public const PASSWORD = 'password';

    public function run(): void
    {
        $user = (new User)->forceFill([
            'username' => 'visual',
            'email' => self::EMAIL,
            'password' => Hash::make(self::PASSWORD),
            'first_name' => 'Wanjiku',
            'last_name' => 'Kamau',
            'role' => 'client',
            'status' => 'active',
            'email_verified_at' => '2025-01-01 08:00:00',
            // Not a new account, so the tour doesn't start by itself.
            'created_at' => '2025-01-01 08:00:00',
        ]);
        $user->save();

        $project = (new Project)->forceFill([
            'name' => 'Kitengela site',
            'description' => 'Three-bedroom bungalow on a quarter acre.',
            'client_id' => $user->id,
            'status' => 'active',
            'start_date' => '2026-03-02',
            'end_date' => '2026-12-18',
            'budget' => 4500000,
            'currency' => 'KES',
            'location' => 'Kitengela',
        ]);
        $project->save();

        $expenses = [
            ['Cement, 40 bags', 'Bamburi Hardware', 32000, 'materials', 'mobile_money', '2026-10-20', 'MPS7Q2X1'],
            ['Sand, 2 lorries', 'Athi River Quarry', 28000, 'materials', 'cash', '2026-10-18', null],
            ['Masons, week 12', 'Site crew', 45000, 'labour', 'mobile_money', '2026-10-17', 'MPS6K9D4'],
            ['Steel bars Y12', 'Mabati Rolling Mills', 61500, 'materials', 'bank_transfer', '2026-10-15', 'BT-20931'],
            ['Water bowser', 'Kitengela Water', 6000, 'utilities', 'cash', '2026-10-12', null],
            ['Site supervision', 'Otieno & Co.', 25000, 'professional', 'bank_transfer', '2026-10-10', 'BT-20877'],
        ];

        foreach ($expenses as [$title, $recipient, $amount, $category, $method, $date, $reference]) {
            (new Expense)->forceFill([
                'project_id' => $project->id,
                'user_id' => $user->id,
                'title' => $title,
                'recipient' => $recipient,
                'amount' => $amount,
                'currency' => 'KES',
                'category' => $category,
                'payment_method' => $method,
                'reference_number' => $reference,
                'expense_date' => $date,
                'time' => '10:30',
                'status' => 'approved',
            ])->save();
        }
    }
}
