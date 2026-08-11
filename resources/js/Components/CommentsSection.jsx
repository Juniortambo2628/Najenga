import { useState, useEffect, useRef, useCallback } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { MentionsInput, Mention } from 'react-mentions';

const mentionStyle = {
    control: {
        backgroundColor: 'transparent',
        fontSize: 14,
        lineHeight: '1.5',
    },
    input: {
        margin: 0,
        padding: '12px 48px 12px 16px',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        backgroundColor: 'rgba(0,0,0,0.4)',
        color: '#fff',
        outline: 'none',
        minHeight: '48px',
        maxHeight: '128px',
        overflow: 'auto',
        scrollbarWidth: 'none', // Firefox
        msOverflowStyle: 'none', // IE/Edge
    },
    highlighter: {
        padding: '12px 48px 12px 16px',
        border: '1px solid transparent',
    },
    suggestions: {
        list: {
            backgroundColor: '#1a1a1a',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
            maxHeight: '200px',
            overflowY: 'auto',
        },
        item: {
            padding: '10px 14px',
            color: '#d1d5db',
            fontSize: '13px',
            transition: 'all 0.15s',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            '&focused': {
                backgroundColor: 'rgba(139,0,0,0.3)',
                color: '#fff',
            },
        },
    },
};

// Renders @mentions as highlighted spans
function renderCommentBody(body) {
    if (!body) return '';
    // Match react-mentions markup: @[Name](userId)
    const parts = body.split(/(@\[[^\]]+\]\(\d+\))/g);
    return parts.map((part, i) => {
        const match = part.match(/@\[([^\]]+)\]\((\d+)\)/);
        if (match) {
            return (
                <span key={i} className="text-[#DC143C] font-semibold cursor-pointer hover:underline">
                    @{match[1]}
                </span>
            );
        }
        return part;
    });
}

export default function CommentsSection({ type, id, projectId }) {
    const { auth } = usePage().props;
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [editingComment, setEditingComment] = useState(null);
    const [editBody, setEditBody] = useState('');
    const [loading, setLoading] = useState(false);
    const [projectUsers, setProjectUsers] = useState([]);

    // Fetch project members for @mention
    useEffect(() => {
        if (!projectId) return;
        axios.get(`/projects/${projectId}/users`)
            .then(res => {
                setProjectUsers(
                    res.data.map(u => ({ id: u.id.toString(), display: u.name }))
                );
            })
            .catch(() => {});
    }, [projectId]);

    const fetchComments = async () => {
        try {
            const response = await axios.get('/comments', {
                params: { commentable_id: id, commentable_type: type }
            });
            setComments(response.data);
        } catch (error) {
            console.error("Failed to fetch comments", error);
        }
    };

    useEffect(() => {
        if (id && type) {
            fetchComments();
        }
    }, [id, type]);

    // Mention data callback (can be async for server-side search)
    const fetchUsers = useCallback((query, callback) => {
        if (!query) {
            callback(projectUsers);
            return;
        }
        const filtered = projectUsers.filter(u =>
            u.display.toLowerCase().includes(query.toLowerCase())
        );
        callback(filtered);
    }, [projectUsers]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setLoading(true);
        try {
            const response = await axios.post('/comments', {
                body: newComment,
                commentable_id: id,
                commentable_type: type,
                parent_id: replyTo?.id || null
            });
            
            if (replyTo) {
                setComments(comments.map(c => {
                    if (c.id === replyTo.id) {
                        return { ...c, replies: [...(c.replies || []), response.data] };
                    }
                    return c;
                }));
            } else {
                setComments([response.data, ...comments]);
            }
            
            setNewComment('');
            setReplyTo(null);
        } catch (error) {
            console.error("Failed to post comment", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!editBody.trim()) return;

        setLoading(true);
        try {
            const response = await axios.patch(`/comments/${editingComment.id}`, {
                body: editBody
            });
            
            const updateRecursive = (list) => list.map(c => {
                if (c.id === editingComment.id) return { ...c, body: response.data.body };
                if (c.replies) return { ...c, replies: updateRecursive(c.replies) };
                return c;
            });

            setComments(updateRecursive(comments));
            setEditingComment(null);
            setEditBody('');
        } catch (error) {
            console.error("Failed to update comment", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (commentId) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;
        try {
            await axios.delete(`/comments/${commentId}`);
            
            const deleteRecursive = (list) => list.filter(c => {
                if (c.id === commentId) return false;
                if (c.replies) {
                    c.replies = deleteRecursive(c.replies);
                }
                return true;
            });

            setComments(deleteRecursive([...comments]));
        } catch (error) {
            console.error("Failed to delete comment", error);
        }
    };

    const CommentItem = ({ comment, isReply = false }) => {
        const isAuthor = comment.user_id === auth.user.id;
        const isEditing = editingComment?.id === comment.id;

        return (
            <div className={`group ${isReply ? 'ml-8 mt-3 bg-white/5' : 'bg-white/5'} p-4 rounded-xl border border-white/5 transition-all hover:border-white/10`}>
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8B0000] to-[#DC143C] flex items-center justify-center text-white text-xs font-bold uppercase">
                            {comment.user?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <span className="text-sm font-bold text-gray-200">{comment.user?.name || 'User'}</span>
                            <span className="ml-2 text-[10px] text-gray-500 uppercase tracking-wider">
                                {formatDistanceToNow(new Date(comment.created_at))} ago
                            </span>
                        </div>
                    </div>
                    {!isEditing && (
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!isReply && (
                                <button 
                                    onClick={() => { setReplyTo(comment); setNewComment(''); }}
                                    className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                                >
                                    <i className="fas fa-reply scale-75"></i> Reply
                                </button>
                            )}
                            {isAuthor && (
                                <>
                                    <button 
                                        onClick={() => { setEditingComment(comment); setEditBody(comment.body); }}
                                        className="text-xs text-gray-400 hover:text-amber-500"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(comment.id)}
                                        className="text-xs text-gray-400 hover:text-red-500"
                                    >
                                        Delete
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {isEditing ? (
                    <form onSubmit={handleUpdate} className="mt-2">
                        <MentionsInput
                            value={editBody}
                            onChange={(e) => setEditBody(e.target.value)}
                            style={mentionStyle}
                            placeholder="Edit your comment..."
                            a11ySuggestionsListLabel="Suggested users"
                        >
                            <Mention
                                trigger="@"
                                data={fetchUsers}
                                displayTransform={(id, display) => `@${display}`}
                                markup="@[__display__](__id__)"
                                appendSpaceOnAdd
                                style={{ backgroundColor: 'rgba(139,0,0,0.2)' }}
                            />
                        </MentionsInput>
                        <div className="flex justify-end gap-2 mt-2">
                            <button 
                                type="button" 
                                onClick={() => setEditingComment(null)}
                                className="text-xs text-gray-500 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="text-xs bg-[#8B0000] text-white px-3 py-1 rounded hover:bg-[#DC143C]"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                ) : (
                    <p className="text-gray-300 text-sm leading-relaxed">{renderCommentBody(comment.body)}</p>
                )}

                {/* Nested Replies */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-1">
                        {comment.replies.map(reply => (
                            <CommentItem key={reply.id} comment={reply} isReply={true} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-[#111] rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
                <h4 className="text-white font-bold flex items-center gap-2">
                    <i className="fas fa-comments text-[#8B0000]"></i>
                    Activity Feed
                </h4>
                <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-full border border-white/5">
                    {comments.length} items
                </span>
            </div>

            {/* Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {comments.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center h-40 opacity-30 grayscale">
                        <i className="fas fa-comment-slash text-4xl mb-2"></i>
                        <p className="text-sm font-medium">No activity yet</p>
                    </div>
                )}
                {comments.map(comment => (
                    <CommentItem key={comment.id} comment={comment} />
                ))}
            </div>

            {/* Form Area */}
            <div className="p-4 bg-black/60 border-t border-white/10">
                {replyTo && (
                    <div className="flex justify-between items-center bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 mb-3">
                        <span className="text-xs text-amber-500">
                            Replying to <span className="font-bold">@{replyTo.user?.name}</span>
                        </span>
                        <button onClick={() => setReplyTo(null)} className="text-amber-500 hover:text-amber-400">
                            <i className="fas fa-times scale-75"></i>
                        </button>
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="relative group">
                    <MentionsInput
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={replyTo ? "Write a reply... (use @ to tag)" : "Share your thoughts... (use @ to tag)"}
                        style={mentionStyle}
                        a11ySuggestionsListLabel="Suggested users"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    >
                        <Mention
                            trigger="@"
                            data={fetchUsers}
                            displayTransform={(id, display) => `@${display}`}
                            markup="@[__display__](__id__)"
                            appendSpaceOnAdd
                            style={{ backgroundColor: 'rgba(139,0,0,0.2)' }}
                            renderSuggestion={(suggestion, search, highlightedDisplay, index, focused) => (
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#8B0000] to-[#DC143C] flex items-center justify-center text-white text-[10px] font-bold uppercase shrink-0">
                                        {suggestion.display?.charAt(0) || '?'}
                                    </div>
                                    <span className="truncate">{highlightedDisplay}</span>
                                </div>
                            )}
                        />
                    </MentionsInput>
                    <button 
                        type="submit" 
                        disabled={loading || !newComment.trim()}
                        className="absolute right-2 bottom-2 text-gray-400 hover:text-white bg-[#8B0000] hover:bg-[#DC143C] w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 disabled:hover:bg-[#8B0000] transition-all z-10"
                    >
                        <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-paper-plane'} scale-90`}></i>
                    </button>
                </form>

                {projectId && projectUsers.length > 0 && (
                    <p className="text-[10px] text-gray-600 mt-2 text-center">
                        Type <span className="text-[#DC143C] font-mono">@</span> to mention {projectUsers.length} team member{projectUsers.length !== 1 ? 's' : ''}
                    </p>
                )}
            </div>
        </div>
    );
}
