<?php

namespace Tests\Unit;

use App\Policies\AnnotationPolicy;
use App\Policies\CommentPolicy;
use App\Policies\ConversationPolicy;
use App\Policies\DocumentPolicy;
use App\Policies\ExpensePolicy;
use App\Policies\FolderPolicy;
use App\Policies\MessagePolicy;
use App\Policies\PhotoPolicy;
use App\Policies\ProjectPolicy;
use App\Policies\ReceiptPolicy;
use App\Policies\TimelinePolicy;
use App\Policies\UserPolicy;
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

class PolicyTest extends TestCase
{
    use RefreshDatabase;

    public function test_project_policy_owner_can_view(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $user->id]);

        $this->assertTrue((new ProjectPolicy)->view($user, $project));
    }

    public function test_project_policy_non_owner_cannot_view(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $other->id]);

        $this->assertFalse((new ProjectPolicy)->view($user, $project));
    }

    public function test_project_policy_shared_user_can_view(): void
    {
        $owner = User::factory()->create();
        $shared = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $owner->id]);
        $project->users()->attach($shared->id);

        $this->assertTrue((new ProjectPolicy)->view($shared, $project));
    }

    public function test_project_policy_only_owner_can_delete(): void
    {
        $owner = User::factory()->create();
        $shared = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $owner->id]);
        $project->users()->attach($shared->id, ['role' => 'editor']);

        $this->assertTrue((new ProjectPolicy)->delete($owner, $project));
        $this->assertFalse((new ProjectPolicy)->delete($shared, $project));
    }

    public function test_project_policy_owner_can_update(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $user->id]);

        $this->assertTrue((new ProjectPolicy)->update($user, $project));
    }

    public function test_project_policy_non_owner_cannot_update(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $other->id]);

        $this->assertFalse((new ProjectPolicy)->update($user, $project));
    }

    public function test_expense_policy_owner_can_view(): void
    {
        $user = User::factory()->create();
        $expense = Expense::factory()->create(['user_id' => $user->id]);

        $this->assertTrue((new ExpensePolicy)->view($user, $expense));
    }

    public function test_expense_policy_non_owner_cannot_view(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $expense = Expense::factory()->create(['user_id' => $other->id]);

        $this->assertFalse((new ExpensePolicy)->view($user, $expense));
    }

    public function test_expense_policy_owner_can_delete(): void
    {
        $user = User::factory()->create();
        $expense = Expense::factory()->create(['user_id' => $user->id]);

        $this->assertTrue((new ExpensePolicy)->delete($user, $expense));
    }

    public function test_expense_policy_non_owner_cannot_delete(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $expense = Expense::factory()->create(['user_id' => $other->id]);

        $this->assertFalse((new ExpensePolicy)->delete($user, $expense));
    }

    public function test_expense_policy_owner_can_update(): void
    {
        $user = User::factory()->create();
        $expense = Expense::factory()->create(['user_id' => $user->id]);

        $this->assertTrue((new ExpensePolicy)->update($user, $expense));
    }

    public function test_expense_policy_non_owner_cannot_update(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $expense = Expense::factory()->create(['user_id' => $other->id]);

        $this->assertFalse((new ExpensePolicy)->update($user, $expense));
    }

    public function test_user_policy_admin_can_manage(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();

        $policy = new UserPolicy;
        $this->assertTrue($policy->viewAny($admin));
        $this->assertTrue($policy->create($admin));
        $this->assertTrue($policy->update($admin, $user));
        $this->assertTrue($policy->delete($admin, $user));
    }

    public function test_user_policy_client_cannot_manage(): void
    {
        $client = User::factory()->create(['role' => 'client']);
        $other = User::factory()->create();

        $policy = new UserPolicy;
        $this->assertFalse($policy->viewAny($client));
        $this->assertFalse($policy->create($client));
        $this->assertFalse($policy->update($client, $other));
        $this->assertFalse($policy->delete($client, $other));
    }

    public function test_user_policy_user_can_view_self(): void
    {
        $user = User::factory()->create();

        $this->assertTrue((new UserPolicy)->view($user, $user));
    }

    public function test_user_policy_client_cannot_view_other(): void
    {
        $client = User::factory()->create(['role' => 'client']);
        $other = User::factory()->create();

        $this->assertFalse((new UserPolicy)->view($client, $other));
    }

    public function test_photo_policy_owner_can_manage(): void
    {
        $user = User::factory()->create();
        $photo = Photo::factory()->create(['user_id' => $user->id]);

        $policy = new PhotoPolicy;
        $this->assertTrue($policy->update($user, $photo));
        $this->assertTrue($policy->delete($user, $photo));
    }

    public function test_photo_policy_non_owner_cannot_manage(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $photo = Photo::factory()->create(['user_id' => $other->id]);

        $policy = new PhotoPolicy;
        $this->assertFalse($policy->update($user, $photo));
        $this->assertFalse($policy->delete($user, $photo));
    }

    public function test_document_policy_owner_can_manage(): void
    {
        $user = User::factory()->create();
        $document = Document::factory()->create(['user_id' => $user->id]);

        $policy = new DocumentPolicy;
        $this->assertTrue($policy->update($user, $document));
        $this->assertTrue($policy->delete($user, $document));
    }

    public function test_document_policy_non_owner_cannot_manage(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $document = Document::factory()->create(['user_id' => $other->id]);

        $policy = new DocumentPolicy;
        $this->assertFalse($policy->update($user, $document));
        $this->assertFalse($policy->delete($user, $document));
    }

    public function test_timeline_policy_owner_can_update(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $user->id]);
        $timeline = ProjectTimeline::factory()->create(['project_id' => $project->id]);

        $policy = new TimelinePolicy;
        $this->assertTrue($policy->update($user, $timeline));
    }

    public function test_timeline_policy_non_owner_cannot_update(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $other->id]);
        $timeline = ProjectTimeline::factory()->create(['project_id' => $project->id]);

        $policy = new TimelinePolicy;
        $this->assertFalse($policy->update($user, $timeline));
    }

    public function test_timeline_policy_owner_can_delete(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $user->id]);
        $timeline = ProjectTimeline::factory()->create(['project_id' => $project->id]);

        $policy = new TimelinePolicy;
        $this->assertTrue($policy->delete($user, $timeline));
    }

    public function test_timeline_policy_non_owner_cannot_delete(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $other->id]);
        $timeline = ProjectTimeline::factory()->create(['project_id' => $project->id]);

        $policy = new TimelinePolicy;
        $this->assertFalse($policy->delete($user, $timeline));
    }

    public function test_conversation_policy_member_can_view(): void
    {
        $user = User::factory()->create();
        $conversation = Conversation::factory()->create();
        $conversation->users()->attach($user->id);

        $policy = new ConversationPolicy;
        $this->assertTrue($policy->view($user, $conversation));
    }

    public function test_conversation_policy_non_member_cannot_view(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $conversation = Conversation::factory()->create();
        $conversation->users()->attach($other->id);

        $policy = new ConversationPolicy;
        $this->assertFalse($policy->view($user, $conversation));
    }

    public function test_conversation_policy_member_can_update(): void
    {
        $user = User::factory()->create();
        $conversation = Conversation::factory()->create();
        $conversation->users()->attach($user->id);

        $policy = new ConversationPolicy;
        $this->assertTrue($policy->update($user, $conversation));
    }

    public function test_conversation_policy_non_member_cannot_update(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $conversation = Conversation::factory()->create();
        $conversation->users()->attach($other->id);

        $policy = new ConversationPolicy;
        $this->assertFalse($policy->update($user, $conversation));
    }

    public function test_conversation_policy_member_can_delete(): void
    {
        $user = User::factory()->create();
        $conversation = Conversation::factory()->create();
        $conversation->users()->attach($user->id);

        $policy = new ConversationPolicy;
        $this->assertTrue($policy->delete($user, $conversation));
    }

    public function test_conversation_policy_non_member_cannot_delete(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $conversation = Conversation::factory()->create();
        $conversation->users()->attach($other->id);

        $policy = new ConversationPolicy;
        $this->assertFalse($policy->delete($user, $conversation));
    }

    public function test_message_policy_owner_can_update(): void
    {
        $user = User::factory()->create();
        $conversation = Conversation::factory()->create();
        $conversation->users()->attach($user->id);
        $message = Message::factory()->create([
            'conversation_id' => $conversation->id,
            'user_id' => $user->id,
        ]);

        $policy = new MessagePolicy;
        $this->assertTrue($policy->update($user, $message));
    }

    public function test_message_policy_non_owner_cannot_update(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $conversation = Conversation::factory()->create();
        $conversation->users()->attach([$user->id, $other->id]);
        $message = Message::factory()->create([
            'conversation_id' => $conversation->id,
            'user_id' => $other->id,
        ]);

        $policy = new MessagePolicy;
        $this->assertFalse($policy->update($user, $message));
    }

    public function test_message_policy_owner_can_delete(): void
    {
        $user = User::factory()->create();
        $conversation = Conversation::factory()->create();
        $conversation->users()->attach($user->id);
        $message = Message::factory()->create([
            'conversation_id' => $conversation->id,
            'user_id' => $user->id,
        ]);

        $policy = new MessagePolicy;
        $this->assertTrue($policy->delete($user, $message));
    }

    public function test_message_policy_non_owner_cannot_delete(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $conversation = Conversation::factory()->create();
        $conversation->users()->attach([$user->id, $other->id]);
        $message = Message::factory()->create([
            'conversation_id' => $conversation->id,
            'user_id' => $other->id,
        ]);

        $policy = new MessagePolicy;
        $this->assertFalse($policy->delete($user, $message));
    }

    public function test_message_policy_conversation_member_can_view(): void
    {
        $user = User::factory()->create();
        $conversation = Conversation::factory()->create();
        $conversation->users()->attach($user->id);
        $message = Message::factory()->create([
            'conversation_id' => $conversation->id,
            'user_id' => $user->id,
        ]);

        $policy = new MessagePolicy;
        $this->assertTrue($policy->view($user, $message));
    }

    public function test_message_policy_non_member_cannot_view(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $conversation = Conversation::factory()->create();
        $conversation->users()->attach($other->id);
        $message = Message::factory()->create([
            'conversation_id' => $conversation->id,
            'user_id' => $other->id,
        ]);

        $policy = new MessagePolicy;
        $this->assertFalse($policy->view($user, $message));
    }

    public function test_annotation_policy_anyone_can_view(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $annotation = Annotation::factory()->create(['user_id' => $other->id]);

        $policy = new AnnotationPolicy;
        $this->assertTrue($policy->view($user, $annotation));
    }

    public function test_annotation_policy_owner_can_update(): void
    {
        $user = User::factory()->create();
        $annotation = Annotation::factory()->create(['user_id' => $user->id]);

        $policy = new AnnotationPolicy;
        $this->assertTrue($policy->update($user, $annotation));
    }

    public function test_annotation_policy_non_owner_cannot_update(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $annotation = Annotation::factory()->create(['user_id' => $other->id]);

        $policy = new AnnotationPolicy;
        $this->assertFalse($policy->update($user, $annotation));
    }

    public function test_annotation_policy_owner_can_delete(): void
    {
        $user = User::factory()->create();
        $annotation = Annotation::factory()->create(['user_id' => $user->id]);

        $policy = new AnnotationPolicy;
        $this->assertTrue($policy->delete($user, $annotation));
    }

    public function test_annotation_policy_non_owner_cannot_delete(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $annotation = Annotation::factory()->create(['user_id' => $other->id]);

        $policy = new AnnotationPolicy;
        $this->assertFalse($policy->delete($user, $annotation));
    }

    public function test_comment_policy_anyone_can_view(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $comment = Comment::factory()->create(['user_id' => $other->id]);

        $policy = new CommentPolicy;
        $this->assertTrue($policy->view($user, $comment));
    }

    public function test_comment_policy_owner_can_update(): void
    {
        $user = User::factory()->create();
        $comment = Comment::factory()->create(['user_id' => $user->id]);

        $policy = new CommentPolicy;
        $this->assertTrue($policy->update($user, $comment));
    }

    public function test_comment_policy_non_owner_cannot_update(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $comment = Comment::factory()->create(['user_id' => $other->id]);

        $policy = new CommentPolicy;
        $this->assertFalse($policy->update($user, $comment));
    }

    public function test_comment_policy_owner_can_delete(): void
    {
        $user = User::factory()->create();
        $comment = Comment::factory()->create(['user_id' => $user->id]);

        $policy = new CommentPolicy;
        $this->assertTrue($policy->delete($user, $comment));
    }

    public function test_comment_policy_non_owner_cannot_delete(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $comment = Comment::factory()->create(['user_id' => $other->id]);

        $policy = new CommentPolicy;
        $this->assertFalse($policy->delete($user, $comment));
    }

    public function test_folder_policy_owner_can_update(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $user->id]);
        $folder = Folder::factory()->create(['project_id' => $project->id]);

        $policy = new FolderPolicy;
        $this->assertTrue($policy->update($user, $folder));
    }

    public function test_folder_policy_non_owner_cannot_update(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $other->id]);
        $folder = Folder::factory()->create(['project_id' => $project->id]);

        $policy = new FolderPolicy;
        $this->assertFalse($policy->update($user, $folder));
    }

    public function test_folder_policy_owner_can_delete(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $user->id]);
        $folder = Folder::factory()->create(['project_id' => $project->id]);

        $policy = new FolderPolicy;
        $this->assertTrue($policy->delete($user, $folder));
    }

    public function test_folder_policy_non_owner_cannot_delete(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $other->id]);
        $folder = Folder::factory()->create(['project_id' => $project->id]);

        $policy = new FolderPolicy;
        $this->assertFalse($policy->delete($user, $folder));
    }

    public function test_receipt_policy_owner_can_view(): void
    {
        $user = User::factory()->create();
        $expense = Expense::factory()->create(['user_id' => $user->id]);
        $receipt = Receipt::factory()->create(['expense_id' => $expense->id]);

        $policy = new ReceiptPolicy;
        $this->assertTrue($policy->view($user, $receipt));
    }

    public function test_receipt_policy_non_owner_cannot_view(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $expense = Expense::factory()->create(['user_id' => $other->id]);
        $receipt = Receipt::factory()->create(['expense_id' => $expense->id]);

        $policy = new ReceiptPolicy;
        $this->assertFalse($policy->view($user, $receipt));
    }

    public function test_receipt_policy_owner_can_update(): void
    {
        $user = User::factory()->create();
        $expense = Expense::factory()->create(['user_id' => $user->id]);
        $receipt = Receipt::factory()->create(['expense_id' => $expense->id]);

        $policy = new ReceiptPolicy;
        $this->assertTrue($policy->update($user, $receipt));
    }

    public function test_receipt_policy_non_owner_cannot_update(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $expense = Expense::factory()->create(['user_id' => $other->id]);
        $receipt = Receipt::factory()->create(['expense_id' => $expense->id]);

        $policy = new ReceiptPolicy;
        $this->assertFalse($policy->update($user, $receipt));
    }

    public function test_receipt_policy_owner_can_delete(): void
    {
        $user = User::factory()->create();
        $expense = Expense::factory()->create(['user_id' => $user->id]);
        $receipt = Receipt::factory()->create(['expense_id' => $expense->id]);

        $policy = new ReceiptPolicy;
        $this->assertTrue($policy->delete($user, $receipt));
    }

    public function test_receipt_policy_non_owner_cannot_delete(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $expense = Expense::factory()->create(['user_id' => $other->id]);
        $receipt = Receipt::factory()->create(['expense_id' => $expense->id]);

        $policy = new ReceiptPolicy;
        $this->assertFalse($policy->delete($user, $receipt));
    }
}
