<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

// /home was merged into /dashboard in Phase 2.7H. Keep old bookmarks and
// any external link alive instead of stranding them on a 404. Declared
// outside the auth group so the redirect fires for signed-out visitors too,
// and /dashboard then sends them on to /login as usual.
//
// Deliberately not Route::redirect(): that builds its Location through
// UrlGenerator::toRoute($route, $params, absolute: false), which yields the
// path-absolute "/dashboard". Resolved against a request under a subdirectory
// that lands on the host root and 404s. url() keeps the install base.
Route::get('/home', fn () => redirect()->to(url('/dashboard'), 301));

Route::middleware(['auth', 'verified'])->group(function () {
    // Projects
    Route::get('/projects', [\App\Http\Controllers\ProjectController::class, 'index'])->name('projects');
    Route::get('/projects/create', [\App\Http\Controllers\ProjectController::class, 'create'])->name('projects.create');
    Route::post('/projects', [\App\Http\Controllers\ProjectController::class, 'store'])->name('projects.store');
    Route::get('/projects/{project}', [\App\Http\Controllers\ProjectController::class, 'show'])->name('projects.show');
    Route::get('/projects/{project}/edit', [\App\Http\Controllers\ProjectController::class, 'edit'])->name('projects.edit');
    Route::patch('/projects/{project}', [\App\Http\Controllers\ProjectController::class, 'update'])->name('projects.update');
    Route::delete('/projects/{project}', [\App\Http\Controllers\ProjectController::class, 'destroy'])->name('projects.destroy');
    Route::get('/projects/{project}/users', [\App\Http\Controllers\ProjectController::class, 'users'])->name('projects.users');

    // Project Sharing
    Route::get('/projects/{project}/share', [\App\Http\Controllers\ProjectShareController::class, 'index'])->name('projects.share.index');
    Route::post('/projects/{project}/share', [\App\Http\Controllers\ProjectShareController::class, 'store'])->name('projects.share.store');
    Route::delete('/projects/{project}/share/{user}', [\App\Http\Controllers\ProjectShareController::class, 'destroy'])->name('projects.share.destroy');

    // Expenses
    Route::get('/expenses', [\App\Http\Controllers\ExpenseController::class, 'index'])->name('expenses');
    Route::get('/expenses/create', [\App\Http\Controllers\ExpenseController::class, 'create'])->name('expenses.create');
    Route::post('/expenses', [\App\Http\Controllers\ExpenseController::class, 'store'])->name('expenses.store');
    Route::post('/expenses/batch', [\App\Http\Controllers\ExpenseController::class, 'batchStore'])->name('expenses.batch');
    Route::delete('/expenses/batch', [\App\Http\Controllers\ExpenseController::class, 'batchDestroy'])->name('expenses.batchDestroy');
    Route::get('/expenses/{expense}', [\App\Http\Controllers\ExpenseController::class, 'show'])->name('expenses.show');
    Route::get('/expenses/{expense}/edit', [\App\Http\Controllers\ExpenseController::class, 'edit'])->name('expenses.edit');
    Route::patch('/expenses/{expense}', [\App\Http\Controllers\ExpenseController::class, 'update'])->name('expenses.update');
    Route::delete('/expenses/{expense}', [\App\Http\Controllers\ExpenseController::class, 'destroy'])->name('expenses.destroy');
    Route::post('/expenses/{expense}/receipt', [\App\Http\Controllers\ExpenseController::class, 'uploadReceipt'])->name('expenses.receipt.upload');
    Route::delete('/expenses/{expense}/receipt', [\App\Http\Controllers\ExpenseController::class, 'removeReceipt'])->name('expenses.receipt.remove');

    // Photos
    Route::get('/photos', [\App\Http\Controllers\PhotoController::class, 'index'])->name('photos');
    Route::get('/photos/create', [\App\Http\Controllers\PhotoController::class, 'create'])->name('photos.create');
    Route::post('/photos', [\App\Http\Controllers\PhotoController::class, 'store'])->name('photos.store');
    Route::get('/photos/{photo}', [\App\Http\Controllers\PhotoController::class, 'show'])->name('photos.show');
    Route::get('/photos/{photo}/edit', [\App\Http\Controllers\PhotoController::class, 'edit'])->name('photos.edit');
    Route::patch('/photos/{photo}', [\App\Http\Controllers\PhotoController::class, 'update'])->name('photos.update');
    Route::delete('/photos/batch', [\App\Http\Controllers\PhotoController::class, 'batchDestroy'])->name('photos.batchDestroy');
    Route::delete('/photos/{photo}', [\App\Http\Controllers\PhotoController::class, 'destroy'])->name('photos.destroy');

    // Documents
    Route::get('/documents', [\App\Http\Controllers\DocumentController::class, 'index'])->name('documents');
    Route::get('/documents/create', [\App\Http\Controllers\DocumentController::class, 'create'])->name('documents.create');
    Route::post('/documents', [\App\Http\Controllers\DocumentController::class, 'store'])->name('documents.store');
    Route::get('/documents/{document}', [\App\Http\Controllers\DocumentController::class, 'show'])->name('documents.show');
    Route::get('/documents/{document}/edit', [\App\Http\Controllers\DocumentController::class, 'edit'])->name('documents.edit');
    Route::patch('/documents/{document}', [\App\Http\Controllers\DocumentController::class, 'update'])->name('documents.update');
    Route::delete('/documents/batch', [\App\Http\Controllers\DocumentController::class, 'batchDestroy'])->name('documents.batchDestroy');
    Route::delete('/documents/{document}', [\App\Http\Controllers\DocumentController::class, 'destroy'])->name('documents.destroy');
    Route::patch('/documents/{document}/move', [\App\Http\Controllers\DocumentController::class, 'move'])->name('documents.move');

    // Folders
    Route::post('/folders', [\App\Http\Controllers\FolderController::class, 'store'])->name('folders.store');
    Route::patch('/folders/{folder}', [\App\Http\Controllers\FolderController::class, 'update'])->name('folders.update');
    Route::delete('/folders/{folder}', [\App\Http\Controllers\FolderController::class, 'destroy'])->name('folders.destroy');

    // Timeline
    Route::get('/timeline', [\App\Http\Controllers\ProjectTimelineController::class, 'index'])->name('timeline');
    Route::get('/timeline/create', [\App\Http\Controllers\ProjectTimelineController::class, 'create'])->name('timeline.create');
    Route::post('/timelines', [\App\Http\Controllers\ProjectTimelineController::class, 'store'])->name('timelines.store');
    Route::get('/timeline/{timeline}', [\App\Http\Controllers\ProjectTimelineController::class, 'show'])->name('timeline.show');
    Route::get('/timeline/{timeline}/edit', [\App\Http\Controllers\ProjectTimelineController::class, 'edit'])->name('timeline.edit');
    Route::patch('/timelines/{timeline}', [\App\Http\Controllers\ProjectTimelineController::class, 'update'])->name('timelines.update');
    Route::delete('/timelines/{timeline}', [\App\Http\Controllers\ProjectTimelineController::class, 'destroy'])->name('timelines.destroy');

    // Users (Admin only)
    Route::middleware('admin')->group(function () {
        Route::get('/users', [\App\Http\Controllers\UserController::class, 'index'])->name('users.index');
        Route::get('/users/create', [\App\Http\Controllers\UserController::class, 'create'])->name('users.create');
        Route::post('/users', [\App\Http\Controllers\UserController::class, 'store'])->name('users.store');
        Route::get('/users/{user}', [\App\Http\Controllers\UserController::class, 'show'])->name('users.show');
        Route::get('/users/{user}/edit', [\App\Http\Controllers\UserController::class, 'edit'])->name('users.edit');
        Route::put('/users/{user}', [\App\Http\Controllers\UserController::class, 'update'])->name('users.update');
        Route::delete('/users/{user}', [\App\Http\Controllers\UserController::class, 'destroy'])->name('users.destroy');
    });

    // Annotations
    Route::get('/annotations', [\App\Http\Controllers\AnnotationController::class, 'index'])->name('annotations.index');
    Route::post('/annotations', [\App\Http\Controllers\AnnotationController::class, 'store'])->name('annotations.store');
    Route::patch('/annotations/{annotation}', [\App\Http\Controllers\AnnotationController::class, 'update'])->name('annotations.update');
    Route::delete('/annotations/{annotation}', [\App\Http\Controllers\AnnotationController::class, 'destroy'])->name('annotations.destroy');

    // Comments
    Route::get('/comments', [\App\Http\Controllers\CommentController::class, 'index'])->name('comments.index');
    Route::post('/comments', [\App\Http\Controllers\CommentController::class, 'store'])->name('comments.store');
    Route::patch('/comments/{comment}', [\App\Http\Controllers\CommentController::class, 'update'])->name('comments.update');
    Route::delete('/comments/{comment}', [\App\Http\Controllers\CommentController::class, 'destroy'])->name('comments.destroy');

    // Messaging
    Route::get('/conversations', [\App\Http\Controllers\ConversationController::class, 'index'])->name('conversations');
    Route::post('/conversations', [\App\Http\Controllers\ConversationController::class, 'store'])->name('conversations.store');
    Route::delete('/conversations/{conversation}', [\App\Http\Controllers\ConversationController::class, 'destroy'])->name('conversations.destroy');
    Route::post('/conversations/{conversation}/leave', [\App\Http\Controllers\ConversationController::class, 'leave'])->name('conversations.leave');
    Route::get('/conversations/{conversation}/messages', [\App\Http\Controllers\MessageController::class, 'index'])->name('conversations.messages');
    Route::post('/conversations/{conversation}/messages', [\App\Http\Controllers\MessageController::class, 'store'])->name('conversations.messages.store');
    Route::patch('/conversations/{conversation}/messages/{message}', [\App\Http\Controllers\MessageController::class, 'update'])->name('conversations.messages.update');
    Route::delete('/conversations/{conversation}/messages/{message}', [\App\Http\Controllers\MessageController::class, 'destroy'])->name('conversations.messages.destroy');

    // Notifications
    Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.markAsRead');
    Route::post('/notifications/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.markAllAsRead');

    // Receipts
    Route::get('/receipt-verification', fn() => \Inertia\Inertia::render('ReceiptVerification'))->name('receipt.verification');
    Route::get('/receipts', [\App\Http\Controllers\ReceiptController::class, 'index'])->name('receipts.index');
    Route::get('/receipts/match', [\App\Http\Controllers\ReceiptController::class, 'match'])->name('receipts.match');
    Route::get('/receipts/{receipt}', [\App\Http\Controllers\ReceiptController::class, 'show'])->name('receipts.show');
    Route::get('/receipts/{receipt}/edit', [\App\Http\Controllers\ReceiptController::class, 'edit'])->name('receipts.edit');
    Route::patch('/receipts/{receipt}', [\App\Http\Controllers\ReceiptController::class, 'update'])->name('receipts.update');
    Route::delete('/receipts/{receipt}', [\App\Http\Controllers\ReceiptController::class, 'destroy'])->name('receipts.destroy');
    Route::post('/receipts/analyze', [\App\Http\Controllers\ReceiptController::class, 'analyze'])->name('receipts.analyze');
    Route::post('/receipts/analyze-bulk', [\App\Http\Controllers\ReceiptController::class, 'analyzeBulk'])->name('receipts.analyze-bulk');
    Route::post('/receipts/store', [\App\Http\Controllers\ReceiptController::class, 'store'])->name('receipts.store');
    Route::post('/receipts/store-bulk', [\App\Http\Controllers\ReceiptController::class, 'storeBulk'])->name('receipts.store-bulk');

    // Other pages
    Route::get('/activity-logs', [\App\Http\Controllers\ActivityLogController::class, 'index'])->name('activity.logs');
    Route::get('/whatsapp', fn() => \Inertia\Inertia::render('WhatsApp'))->name('whatsapp');
    Route::get('/messages', fn() => \Inertia\Inertia::render('Messages'))->name('messages');
    Route::get('/analytics', [\App\Http\Controllers\AnalyticsController::class, 'index'])->name('analytics');

    // Full-text search (MeiliSearch)
    Route::get('/search', [\App\Http\Controllers\SearchController::class, 'index'])->name('search');

    // Storage
    Route::get('/storage/{path}', [\App\Http\Controllers\StorageController::class, 'show'])->where('path', '.*')->name('storage.show');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
