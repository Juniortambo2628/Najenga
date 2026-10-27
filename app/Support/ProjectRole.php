<?php

namespace App\Support;

/**
 * A person's role in one project. The global role (admin / manager / client)
 * decides what someone can do in Najenga; the project role decides what they
 * can do in one project:
 *
 *   owner    the project's client: everything, including deleting the project
 *   manager  edits everything and manages members
 *   editor   edits the project and the records under it
 *   viewer   reads and comments only
 */
final class ProjectRole
{
    public const OWNER = 'owner';
    public const MANAGER = 'manager';
    public const EDITOR = 'editor';
    public const VIEWER = 'viewer';

    /** Every role, most to least capable. */
    public const ALL = [self::OWNER, self::MANAGER, self::EDITOR, self::VIEWER];

    /** Roles that may change the project and the records under it. */
    public const EDIT = [self::OWNER, self::MANAGER, self::EDITOR];

    /** Roles that may add or remove members. */
    public const MANAGE = [self::OWNER, self::MANAGER];

    /** Roles a member can be given (owner comes from projects.client_id). */
    public const ASSIGNABLE = [self::MANAGER, self::EDITOR, self::VIEWER];

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
