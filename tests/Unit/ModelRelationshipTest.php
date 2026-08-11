<?php

namespace Tests\Unit;

use App\Models\Annotation;
use App\Models\Comment;
use App\Models\Conversation;
use App\Models\Document;
use App\Models\Expense;
use App\Models\Folder;
use App\Models\Message;
use App\Models\Photo;
use App\Models\Project;
use App\Models\ProjectTimeline;
use App\Models\Receipt;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ModelRelationshipTest extends TestCase
{
    use RefreshDatabase;

    public function test_project_belongs_to_client(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $user->id]);

        $this->assertInstanceOf(User::class, $project->client);
        $this->assertEquals($user->id, $project->client_id);
    }

    public function test_project_has_many_expenses(): void
    {
        $project = Project::factory()->create();
        Expense::factory()->count(3)->create(['project_id' => $project->id, 'user_id' => $project->client_id]);

        $this->assertCount(3, $project->expenses);
    }

    public function test_project_has_many_photos(): void
    {
        $project = Project::factory()->create();
        Photo::factory()->count(2)->create(['project_id' => $project->id, 'user_id' => $project->client_id]);

        $this->assertCount(2, $project->photos);
    }

    public function test_project_has_many_documents(): void
    {
        $project = Project::factory()->create();
        Document::factory()->count(4)->create(['project_id' => $project->id, 'user_id' => $project->client_id]);

        $this->assertCount(4, $project->documents);
    }

    public function test_project_has_many_timelines(): void
    {
        $project = Project::factory()->create();
        ProjectTimeline::factory()->count(2)->create(['project_id' => $project->id]);

        $this->assertCount(2, $project->timelines);
    }

    public function test_project_has_many_folders(): void
    {
        $project = Project::factory()->create();
        Folder::factory()->count(3)->create(['project_id' => $project->id]);

        $this->assertCount(3, $project->folders);
    }

    public function test_project_has_shared_users(): void
    {
        $project = Project::factory()->create();
        $users = User::factory()->count(2)->create();
        $project->users()->attach($users->pluck('id'));

        $this->assertCount(2, $project->users);
    }

    public function test_project_has_many_annotations(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $user->id]);
        $photo = Photo::factory()->create(['user_id' => $user->id, 'project_id' => $project->id]);
        Annotation::factory()->count(3)->create([
            'annotatable_type' => Photo::class,
            'annotatable_id' => $photo->id,
            'user_id' => $user->id,
        ]);

        $this->assertCount(3, $photo->annotations);
    }

    public function test_project_has_many_comments(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $user->id]);
        Comment::factory()->count(2)->create([
            'commentable_type' => Project::class,
            'commentable_id' => $project->id,
            'user_id' => $user->id,
        ]);

        $this->assertCount(2, $project->comments);
    }

    public function test_project_belongs_to_manager(): void
    {
        $manager = User::factory()->create(['role' => 'manager']);
        $project = Project::factory()->create(['manager_id' => $manager->id]);

        $this->assertInstanceOf(User::class, $project->manager);
        $this->assertEquals($manager->id, $project->manager_id);
    }

    public function test_expense_belongs_to_user(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $user->id]);
        $expense = Expense::factory()->create(['user_id' => $user->id, 'project_id' => $project->id]);

        $this->assertInstanceOf(User::class, $expense->user);
    }

    public function test_expense_belongs_to_project(): void
    {
        $project = Project::factory()->create();
        $expense = Expense::factory()->create(['project_id' => $project->id, 'user_id' => $project->client_id]);

        $this->assertInstanceOf(Project::class, $expense->project);
    }

    public function test_expense_has_one_receipt(): void
    {
        $expense = Expense::factory()->create();
        $receipt = Receipt::factory()->create(['expense_id' => $expense->id]);

        $this->assertInstanceOf(Receipt::class, $expense->receipt);
        $this->assertEquals($receipt->id, $expense->receipt->id);
    }

    public function test_photo_belongs_to_user_and_project(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $user->id]);
        $photo = Photo::factory()->create(['user_id' => $user->id, 'project_id' => $project->id]);

        $this->assertInstanceOf(User::class, $photo->user);
        $this->assertInstanceOf(Project::class, $photo->project);
    }

    public function test_photo_has_many_annotations(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $user->id]);
        $photo = Photo::factory()->create(['user_id' => $user->id, 'project_id' => $project->id]);
        Annotation::factory()->count(2)->create([
            'annotatable_type' => Photo::class,
            'annotatable_id' => $photo->id,
            'user_id' => $user->id,
        ]);

        $this->assertCount(2, $photo->annotations);
    }

    public function test_photo_has_many_comments(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $user->id]);
        $photo = Photo::factory()->create(['user_id' => $user->id, 'project_id' => $project->id]);
        Comment::factory()->count(3)->create([
            'commentable_type' => Photo::class,
            'commentable_id' => $photo->id,
            'user_id' => $user->id,
        ]);

        $this->assertCount(3, $photo->comments);
    }

    public function test_document_belongs_to_user_and_project(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $user->id]);
        $document = Document::factory()->create(['user_id' => $user->id, 'project_id' => $project->id]);

        $this->assertInstanceOf(User::class, $document->user);
        $this->assertInstanceOf(Project::class, $document->project);
    }

    public function test_document_can_belong_to_folder(): void
    {
        $project = Project::factory()->create();
        $folder = Folder::factory()->create(['project_id' => $project->id]);
        $document = Document::factory()->create([
            'project_id' => $project->id,
            'user_id' => $project->client_id,
            'folder_id' => $folder->id,
        ]);

        $this->assertInstanceOf(Folder::class, $document->folder);
    }

    public function test_document_has_many_annotations(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $user->id]);
        $document = Document::factory()->create(['user_id' => $user->id, 'project_id' => $project->id]);
        Annotation::factory()->count(2)->create([
            'annotatable_type' => Document::class,
            'annotatable_id' => $document->id,
            'user_id' => $user->id,
        ]);

        $this->assertCount(2, $document->annotations);
    }

    public function test_document_has_many_comments(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $user->id]);
        $document = Document::factory()->create(['user_id' => $user->id, 'project_id' => $project->id]);
        Comment::factory()->count(2)->create([
            'commentable_type' => Document::class,
            'commentable_id' => $document->id,
            'user_id' => $user->id,
        ]);

        $this->assertCount(2, $document->comments);
    }

    public function test_folder_belongs_to_project(): void
    {
        $project = Project::factory()->create();
        $folder = Folder::factory()->create(['project_id' => $project->id]);

        $this->assertInstanceOf(Project::class, $folder->project);
    }

    public function test_folder_can_have_parent(): void
    {
        $project = Project::factory()->create();
        $parent = Folder::factory()->create(['project_id' => $project->id]);
        $child = Folder::factory()->create(['project_id' => $project->id, 'parent_id' => $parent->id]);

        $this->assertNull($parent->parent_id);
        $this->assertEquals($parent->id, $child->parent_id);
    }

    public function test_folder_has_many_children(): void
    {
        $project = Project::factory()->create();
        $parent = Folder::factory()->create(['project_id' => $project->id]);
        Folder::factory()->count(3)->create(['project_id' => $project->id, 'parent_id' => $parent->id]);

        $this->assertCount(3, $parent->children);
    }

    public function test_folder_has_many_documents(): void
    {
        $project = Project::factory()->create();
        $folder = Folder::factory()->create(['project_id' => $project->id]);
        Document::factory()->count(2)->create([
            'project_id' => $project->id,
            'user_id' => $project->client_id,
            'folder_id' => $folder->id,
        ]);

        $this->assertCount(2, $folder->documents);
    }

    public function test_timeline_belongs_to_project(): void
    {
        $project = Project::factory()->create();
        $timeline = ProjectTimeline::factory()->create(['project_id' => $project->id]);

        $this->assertInstanceOf(Project::class, $timeline->project);
    }

    public function test_conversation_has_many_messages(): void
    {
        $conversation = Conversation::factory()->create();
        $user = User::factory()->create();
        Message::factory()->count(5)->create([
            'conversation_id' => $conversation->id,
            'user_id' => $user->id,
        ]);

        $this->assertCount(5, $conversation->messages);
    }

    public function test_conversation_has_many_users(): void
    {
        $conversation = Conversation::factory()->create();
        $users = User::factory()->count(3)->create();
        $conversation->users()->attach($users->pluck('id'));

        $this->assertCount(3, $conversation->users);
    }

    public function test_conversation_belongs_to_project(): void
    {
        $project = Project::factory()->create();
        $conversation = Conversation::factory()->create(['project_id' => $project->id]);

        $this->assertInstanceOf(Project::class, $conversation->project);
    }

    public function test_conversation_has_one_last_message(): void
    {
        $conversation = Conversation::factory()->create();
        $user = User::factory()->create();
        $conversation->users()->attach($user->id);
        Message::factory()->create([
            'conversation_id' => $conversation->id,
            'user_id' => $user->id,
            'created_at' => now()->subMinute(),
        ]);
        $latest = Message::factory()->create([
            'conversation_id' => $conversation->id,
            'user_id' => $user->id,
            'created_at' => now(),
        ]);

        $this->assertInstanceOf(Message::class, $conversation->lastMessage);
        $this->assertEquals($latest->id, $conversation->lastMessage->id);
    }

    public function test_message_belongs_to_user_and_conversation(): void
    {
        $user = User::factory()->create();
        $conversation = Conversation::factory()->create();
        $message = Message::factory()->create([
            'user_id' => $user->id,
            'conversation_id' => $conversation->id,
        ]);

        $this->assertInstanceOf(User::class, $message->user);
        $this->assertInstanceOf(Conversation::class, $message->conversation);
    }

    public function test_user_has_client_projects(): void
    {
        $user = User::factory()->create();
        Project::factory()->count(3)->create(['client_id' => $user->id]);

        $this->assertCount(3, $user->clientProjects);
    }

    public function test_user_has_expenses(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $user->id]);
        Expense::factory()->count(4)->create(['user_id' => $user->id, 'project_id' => $project->id]);

        $this->assertCount(4, $user->expenses);
    }

    public function test_user_has_photos(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $user->id]);
        Photo::factory()->count(2)->create(['user_id' => $user->id, 'project_id' => $project->id]);

        $this->assertCount(2, $user->photos);
    }

    public function test_user_has_documents(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $user->id]);
        Document::factory()->count(3)->create(['user_id' => $user->id, 'project_id' => $project->id]);

        $this->assertCount(3, $user->documents);
    }

    public function test_user_has_conversations(): void
    {
        $user = User::factory()->create();
        $conversations = Conversation::factory()->count(2)->create();
        $conversations->each(fn($c) => $c->users()->attach($user->id));

        $this->assertCount(2, $user->conversations);
    }

    public function test_user_has_activity_logs(): void
    {
        $user = User::factory()->create();
        \App\Models\ActivityLog::factory()->count(3)->create(['user_id' => $user->id]);

        $this->assertCount(3, $user->activityLogs);
    }

    public function test_user_has_managed_projects(): void
    {
        $manager = User::factory()->create(['role' => 'manager']);
        Project::factory()->count(2)->create(['manager_id' => $manager->id]);

        $this->assertCount(2, $manager->managedProjects);
    }

    public function test_annotation_is_polymorphic(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $user->id]);
        $photo = Photo::factory()->create(['user_id' => $user->id, 'project_id' => $project->id]);

        $annotation = Annotation::factory()->create([
            'annotatable_type' => Photo::class,
            'annotatable_id' => $photo->id,
            'user_id' => $user->id,
        ]);

        $this->assertInstanceOf(Photo::class, $annotation->annotatable);
    }

    public function test_annotation_belongs_to_user(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $user->id]);
        $photo = Photo::factory()->create(['user_id' => $user->id, 'project_id' => $project->id]);
        $annotation = Annotation::factory()->create([
            'annotatable_type' => Photo::class,
            'annotatable_id' => $photo->id,
            'user_id' => $user->id,
        ]);

        $this->assertInstanceOf(User::class, $annotation->user);
    }

    public function test_comment_is_polymorphic(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $user->id]);
        $photo = Photo::factory()->create(['user_id' => $user->id, 'project_id' => $project->id]);

        $comment = Comment::factory()->create([
            'commentable_type' => Photo::class,
            'commentable_id' => $photo->id,
            'user_id' => $user->id,
        ]);

        $this->assertInstanceOf(Photo::class, $comment->commentable);
    }

    public function test_comment_belongs_to_user(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $user->id]);
        $photo = Photo::factory()->create(['user_id' => $user->id, 'project_id' => $project->id]);
        $comment = Comment::factory()->create([
            'commentable_type' => Photo::class,
            'commentable_id' => $photo->id,
            'user_id' => $user->id,
        ]);

        $this->assertInstanceOf(User::class, $comment->user);
    }

    public function test_comment_can_have_parent(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $user->id]);
        $photo = Photo::factory()->create(['user_id' => $user->id, 'project_id' => $project->id]);
        $parent = Comment::factory()->create([
            'commentable_type' => Photo::class,
            'commentable_id' => $photo->id,
            'user_id' => $user->id,
        ]);
        $reply = Comment::factory()->create([
            'commentable_type' => Photo::class,
            'commentable_id' => $photo->id,
            'user_id' => $user->id,
            'parent_id' => $parent->id,
        ]);

        $this->assertNull($parent->parent_id);
        $this->assertEquals($parent->id, $reply->parent_id);
    }

    public function test_comment_has_many_replies(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $user->id]);
        $photo = Photo::factory()->create(['user_id' => $user->id, 'project_id' => $project->id]);
        $parent = Comment::factory()->create([
            'commentable_type' => Photo::class,
            'commentable_id' => $photo->id,
            'user_id' => $user->id,
        ]);
        Comment::factory()->count(3)->create([
            'commentable_type' => Photo::class,
            'commentable_id' => $photo->id,
            'user_id' => $user->id,
            'parent_id' => $parent->id,
        ]);

        $this->assertCount(3, $parent->replies);
    }

    public function test_receipt_belongs_to_expense(): void
    {
        $expense = Expense::factory()->create();
        $receipt = Receipt::factory()->create(['expense_id' => $expense->id]);

        $this->assertInstanceOf(Expense::class, $receipt->expense);
        $this->assertEquals($expense->id, $receipt->expense_id);
    }

    public function test_activity_log_belongs_to_user(): void
    {
        $user = User::factory()->create();
        $log = \App\Models\ActivityLog::factory()->create(['user_id' => $user->id]);

        $this->assertInstanceOf(User::class, $log->user);
    }

    public function test_user_name_accessor(): void
    {
        $user = User::factory()->create(['first_name' => 'John', 'last_name' => 'Doe']);

        $this->assertEquals('John Doe', $user->name);
    }
}
