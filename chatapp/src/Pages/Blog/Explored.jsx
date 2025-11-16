import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { API_BASE } from '../../config';
const InstagramFeed = () => {
    const [posts, setPosts] = useState([]);
    const [newComment, setNewComment] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const postRefs = useRef([]);
    const containerRef = useRef();

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    setError('No token found');
                    setLoading(false);
                    return;
                }

                const response = await fetch(`${API_BASE}/api/posts`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });

                const contentType = response.headers.get('content-type');

                if (!contentType || !contentType.includes('application/json')) {
                    const textResponse = await response.text();
                    setError('Server returned HTML instead of JSON');
                    setPosts([]);
                    setLoading(false);
                    return;
                }

                const data = await response.json();
                console.log('FUCKING POSTS DATA:', data); // Debug

                if (response.ok) {
                    if (data.success && data.posts) {
                        setPosts(data.posts);
                        setError(null);
                    } else {
                        setPosts([]);
                        setError('No posts in response');
                    }
                } else {
                    setError(`API Error: ${data.message}`);
                    setPosts([]);
                }
            } catch (error) {
                setError(`Network error: ${error.message}`);
                setPosts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    useEffect(() => {
        if (posts.length > 0 && containerRef.current) {
            gsap.fromTo(containerRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.8, ease: "power2.inOut" }
            );

            postRefs.current.forEach((postEl, index) => {
                if (postEl) {
                    gsap.fromTo(postEl,
                        {
                            opacity: 0,
                            y: 100,
                            scale: 0.8
                        },
                        {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            duration: 0.8,
                            delay: index * 0.1,
                            ease: "back.out(1.7)"
                        }
                    );
                }
            });
        }
    }, [posts]);

    const handleLike = async (postId, isCurrentlyLiked) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/posts/${postId}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();

                const postElement = postRefs.current.find(ref =>
                    ref && (ref.dataset.postId === postId)
                );

                if (postElement) {
                    const likeHeart = postElement.querySelector('.like-heart');
                    if (likeHeart) {
                        gsap.to(likeHeart, {
                            scale: 1.3,
                            duration: 0.2,
                            yoyo: true,
                            repeat: 1,
                            ease: "power2.inOut"
                        });
                    }
                }

                setPosts(prevPosts =>
                    prevPosts.map(post =>
                        post._id === postId || post.id === postId
                            ? {
                                ...post,
                                likes: result.likes,
                                isLiked: result.isLiked
                            }
                            : post
                    )
                );
            }
        } catch (error) {
            console.error('Like error:', error);
        }
    };

    const handleComment = async (postId) => {
        if (!newComment[postId]?.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/posts/${postId}/comment`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: newComment[postId] })
            });

            if (response.ok) {
                const result = await response.json();

                const postElement = postRefs.current.find(ref =>
                    ref && (ref.dataset.postId === postId)
                );

                if (postElement) {
                    const commentInput = postElement.querySelector('.comment-input');
                    if (commentInput) {
                        gsap.to(commentInput, {
                            backgroundColor: "#374151",
                            duration: 0.2,
                            onComplete: () => {
                                gsap.to(commentInput, {
                                    backgroundColor: "#1f2937",
                                    duration: 0.2
                                });
                            }
                        });
                    }
                }

                setPosts(prevPosts =>
                    prevPosts.map(post =>
                        (post._id === postId || post.id === postId)
                            ? { ...post, comments: result.comments }
                            : post
                    )
                );
                setNewComment(prev => ({ ...prev, [postId]: '' }));
            }
        } catch (error) {
            console.error('Comment error:', error);
        }
    };

    const getFullProfilePictureUrl = (profilePicture) => {
        if (!profilePicture) return `${API_BASE}/uploads/profilepics/DefaultPic.jpeg`; // UPDATED
        if (profilePicture.startsWith('http')) return profilePicture;
        return `${API_BASE}${profilePicture}`; // UPDATED
    };

    const getFullMediaUrl = (mediaUrl) => {
        if (!mediaUrl) return '';
        if (mediaUrl.startsWith('http')) return mediaUrl;
        return `${API_BASE}${mediaUrl}`; // UPDATED
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white text-xl">Loading posts...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h3 className="text-2xl font-bold text-white mb-2">Error</h3>
                    <p className="text-red-400 mb-6 max-w-md">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <div ref={containerRef} className="p-4">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">All Posts</h1>
                        <p className="text-gray-400">{posts.length} posts</p>
                    </div>

                    <div className="space-y-6">
                        {posts.map((post, index) => (
                            <div
                                key={post._id || post.id}
                                data-post-id={post._id || post.id}
                                ref={el => postRefs.current[index] = el}
                                className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg"
                            >
                                <div className="flex items-center space-x-3 mb-4">
                                    <img
                                        src={getFullProfilePictureUrl(post.profilePicture)}
                                        alt={post.username}
                                        className="w-10 h-10 rounded-full border-2 border-white object-cover"
                                        onError={(e) => {
                                          e.target.src = `${API_BASE}/uploads/profilepics/DefaultPic.jpeg`;
                                        }}
                                    />
                                    <div>
                                        <h3 className="font-bold text-white">{post.username}</h3>
                                        <p className="text-gray-400 text-sm">
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <p className="text-white text-lg whitespace-pre-wrap">
                                        {post.content}
                                    </p>

                                    {post.media && Array.isArray(post.media) && post.media.length > 0 && (
                                        <div className="mt-4 grid gap-2">
                                            {post.media.map((media, mediaIndex) => (
                                                <div key={mediaIndex} className="rounded-lg overflow-hidden">
                                                    {media.mediaType === 'image' ? (
                                                        <img
                                                            src={getFullMediaUrl(media.url)}
                                                            alt="Post media"
                                                            className="w-full h-auto max-h-96 object-cover rounded-lg"
                                                            onError={(e) => {
                                                                console.error('Failed to load media:', media.url);
                                                            }}
                                                        />
                                                    ) : (
                                                        <video
                                                            src={getFullMediaUrl(media.url)}
                                                            controls
                                                            className="w-full h-auto rounded-lg"
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center space-x-6 text-gray-400 text-sm mb-3">
                                    <span>{post.likes} likes</span>
                                    <span>{Array.isArray(post.comments) ? post.comments.length : 0} comments</span>
                                </div>

                                <div className="flex items-center space-x-4 border-t border-gray-800 pt-3">
                                    <button
                                        onClick={() => handleLike(post._id || post.id, post.isLiked)}
                                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${post.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        <span className="like-heart text-lg">❤</span>
                                        <span>Like</span>
                                    </button>

                                    <button className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white transition-colors">
                                        <span>💬</span>
                                        <span>Comment</span>
                                    </button>
                                </div>

                                {/* FIXED COMMENTS SECTION - SAFE ARRAY CHECK */}
                                <div className="mt-4 space-y-3">
                                    {Array.isArray(post.comments) && post.comments.map((comment, commentIndex) => (
                                        <div key={commentIndex} className="flex space-x-3">
                                            <div className="bg-gray-800 rounded-2xl px-3 py-2 flex-1">
                                                <span className="font-semibold text-white text-sm">
                                                    {comment.username}
                                                </span>
                                                <p className="text-white text-sm mt-1">{comment.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 flex space-x-3">
                                    <input
                                        type="text"
                                        placeholder="Add a comment..."
                                        value={newComment[post._id || post.id] || ''}
                                        onChange={(e) => setNewComment(prev => ({
                                            ...prev,
                                            [post._id || post.id]: e.target.value
                                        }))}
                                        onKeyPress={(e) => e.key === 'Enter' && handleComment(post._id || post.id)}
                                        className="comment-input flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
                                    />
                                    <button
                                        onClick={() => handleComment(post._id || post.id)}
                                        className="px-4 py-2 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-colors"
                                    >
                                        Post
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {posts.length === 0 && (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">📝</div>
                            <h3 className="text-2xl font-bold text-white mb-2">No posts yet</h3>
                            <p className="text-gray-400">Be the first to create a post</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InstagramFeed;