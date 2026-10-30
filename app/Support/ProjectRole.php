<?php

namespace App\Support;

/**
 * A person's role in one project (as in the OKJT kit and Naoa). Superadmins
 * (users.is_superadmin) run Najenga; the project role decides what someone can
 * do in one project:
 *
 *   owner    edits everything and manages members. The project's client is
 *            its first owner: they can't be removed, and alone delete the
 *            project or change the other owners (co-owners, e.g. its manager)
 *   editor   edits the project and the records under it
 *   viewer   reads and comments only
 */
final class ProjectRole
{
    public const OWNER = 'owner';

    public const EDITOR = 'editor';

    public const VIEWER = 'viewer';

    /** Every role, most to least capable. */
    public const ALL = [self::OWNER, self::EDITOR, self::VIEWER];

    /** Roles that may change the project and the records under it. */
    public const EDIT = [self::OWNER, self::EDITOR];

    /** Roles that may add or remove members. */
    public const MANAGE = [self::OWNER];

    /** Roles a member can be given (owner comes from projects.client_id). */
    public const ASSIGNABLE = [self::OWNER, self::EDITOR, self::VIEWER];

    public static function canEdit(?string $role): bool
    {
        return in_array($role, self::EDIT, true);
    }

    public static function canManage(?string $role): bool
    {
        return in_array($role, self::MANAGE, true);
    }

    public static function label(string $role): string
    {
        return ucfirst($role);
    }
}
