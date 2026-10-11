<?php

namespace App\Rules;

use App\Models\Folder;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Single source of truth for "this folder belongs to that project",
 * shared by the document store/update requests and the move endpoint.
 */
class FolderInProject implements ValidationRule
{
    public function __construct(private mixed $projectId)
    {
    }

    public static function matches(mixed $folderId, mixed $projectId): bool
    {
        if ($folderId === null) {
            return true;
        }

        $folder = Folder::find($folderId);

        if ($folder === null) {
            return true;
        }

        return (int) $folder->project_id === (int) $projectId;
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! self::matches($value, $this->projectId)) {
            $fail('Folder belongs to a different project.');
        }
    }
}
