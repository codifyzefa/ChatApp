import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import io from 'socket.io-client';
import { API_BASE,SOCKET_URL } from '../../config';
gsap.registerPlugin(ScrollTrigger);

const UserDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [activeSection, setActiveSection] = useState('posts');
    const [profilePic, setProfilePic] = useState(`${API_BASE}/uploads/profilepics/DefaultPic.jpeg`);
    const [postContent, setPostContent] = useState('');
    const [postMedia, setPostMedia] = useState([]);
    const fileInputRef = useRef(null);
    const postMediaInputRef = useRef(null);
    const containerRef = useRef(null);
    const leftStickyRef = useRef(null);
    const postsSectionRef = useRef(null);
    const groupsSectionRef = useRef(null);
    const notesSectionRef = useRef(null);
    const postItemsRef = useRef([]);
    const groupItemsRef = useRef([]);
    const noteItemsRef = useRef([]);
    const chatMessagesRef = useRef(null);
    const socketRef = useRef(null);

    const [posts, setPosts] = useState([]);
    const [groups, setGroups] = useState([]);
    const [suggestedGroups, setSuggestedGroups] = useState([]);
    const [folders, setFolders] = useState([]);
    const [notes, setNotes] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [isCreatingPost, setIsCreatingPost] = useState(false);
    const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [newGroup, setNewGroup] = useState({ name: '', description: '', category: 'General', privacy: 'public' });
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [groupMessages, setGroupMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [typingUsers, setTypingUsers] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [onlineMembers, setOnlineMembers] = useState([]);
    const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
    const [showCreateNoteModal, setShowCreateNoteModal] = useState(false);
    const [newFolder, setNewFolder] = useState({ name: '', description: '', color: '#3b82f6' });
    const [newNote, setNewNote] = useState({ title: '', content: '', folderId: '', tags: [], color: '#1f2937' });
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [isCreatingNote, setIsCreatingNote] = useState(false);

    const Icons = {
        posts: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
            </svg>
        ),
        groups: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
        ),
        notes: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
            </svg>
        ),
        like: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
        ),
        comment: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h11c.55 0 1-.45 1-1z" />
            </svg>
        ),
        members: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
        ),
        time: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
            </svg>
        ),
        pin: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
            </svg>
        ),
        camera: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 15.2C13.767 15.2 15.2 13.767 15.2 12 15.2 10.233 13.767 8.8 12 8.8 10.233 8.8 8.8 10.233 8.8 12 8.8 13.767 10.233 15.2 12 15.2zM20 7h-1.6l-1.2-1.6c-.2-.2-.5-.4-.8-.4H7.6c-.3 0-.6.2-.8.4L5.6 7H4c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-8 11c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z" />
            </svg>
        ),
        trash: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
            </svg>
        ),
        media: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
            </svg>
        ),
        add: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
        ),
        close: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
        ),
        send: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
        ),
        like_outline: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
        ),
        folder: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V6h5.17l2 2H20v10z" />
            </svg>
        ),
        document: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
            </svg>
        )
    };

    const fetchUserData = async () => {
        try {
            const userData = localStorage.getItem('user');
            if (!userData) {
                navigate('/login');
                return;
            }

            const userObj = JSON.parse(userData);
            const token = localStorage.getItem('token');
            const userId = userObj.id;

            const response = await fetch(`${API_BASE}/api/users/${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const userDataFromAPI = await response.json();
                setUser(userDataFromAPI.user);
                setProfilePic(`${API_BASE}${userDataFromAPI.user.profilePicture}?t=${Date.now()}`);
                fetchUserPosts(userDataFromAPI.user.id, token);
                fetchUserGroups(userDataFromAPI.user.id, token);
                fetchSuggestedGroups(token);
                fetchFolders(token);
                fetchNotes(token);
            } else {
                console.log("Failed to fetch user data");
            }
        } catch (error) {
            console.log("Fetch error:", error);
        }
    };

    const fetchUserPosts = async (userId, token) => {
        try {
            const response = await fetch(`${API_BASE}/api/users/${userId}/posts`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setPosts(data.posts);
            } else {
                console.log("Failed to fetch user posts");
            }
        } catch (error) {
            console.log("Fetch posts error:", error);
        }
    };

    const fetchUserGroups = async (userId, token) => {
        try {
            const response = await fetch(`${API_BASE}/api/users/${userId}/groups`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setGroups(data.groups);
            } else {
                console.log("Failed to fetch user groups");
            }
        } catch (error) {
            console.log("Fetch groups error:", error);
        }
    };

    const fetchSuggestedGroups = async (token) => {
        try {
            const response = await fetch(`${API_BASE}/api/groups`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSuggestedGroups(data.groups.slice(0, 4));
            } else {
                console.log("Failed to fetch suggested groups");
            }
        } catch (error) {
            console.log("Fetch suggested groups error:", error);
        }
    };

    const fetchFolders = async (token) => {
        try {
            const response = await fetch(`${API_BASE}/api/folders`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setFolders(data.folders);
            } else {
                console.log("Failed to fetch folders");
            }
        } catch (error) {
            console.log("Fetch folders error:", error);
        }
    };

    const fetchNotes = async (token, folderId = null) => {
        try {
            let url = `${API_BASE}/api/notes`;
            if (folderId) {
                url += `?folderId=${folderId}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setNotes(data.notes);
            } else {
                console.log("Failed to fetch notes");
            }
        } catch (error) {
            console.log("Fetch notes error:", error);
        }
    };

    const fetchGroupDetails = async (groupId, token) => {
        try {
            const response = await fetch(`${API_BASE}/api/groups/${groupId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSelectedGroup(data.group);
                setShowGroupModal(true);
                fetchGroupMessages(groupId, token);
                initializeSocket(data.group);
            } else {
                console.log("Failed to fetch group details");
            }
        } catch (error) {
            console.log("Fetch group details error:", error);
        }
    };

    const fetchGroupMessages = async (groupId, token) => {
        try {
            const response = await fetch(`${API_BASE}/api/groups/${groupId}/messages`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setGroupMessages(data.messages);
            } else {
                console.log("Failed to fetch group messages");
            }
        } catch (error) {
            console.log("Fetch group messages error:", error);
        }
    };

    const initializeSocket = (group) => {
        const token = localStorage.getItem('token');

        if (socketRef.current) {
            socketRef.current.disconnect();
        }

        socketRef.current = io(SOCKET_URL, {
            auth: { token }
        });

        socketRef.current.emit('join_group', group._id);

        socketRef.current.on('receive_group_message', (message) => {
            setGroupMessages(prev => [...prev, message]);
        });

        socketRef.current.on('user_joined', (userData) => {
            setOnlineMembers(prev => [...prev.filter(u => u.userId !== userData.userId), userData]);
        });

        socketRef.current.on('user_left', (userData) => {
            setOnlineMembers(prev => prev.filter(u => u.userId !== userData.userId));
        });

        socketRef.current.on('user_typing', (data) => {
            if (data.isTyping) {
                setTypingUsers(prev => [...prev.filter(u => u.userId !== data.userId), data]);
            } else {
                setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
            }
        });

        socketRef.current.on('message_liked', (data) => {
            setGroupMessages(prev => prev.map(msg =>
                msg.id === data.messageId
                    ? { ...msg, likes: data.likes, isLiked: data.isLiked }
                    : msg
            ));
        });
    };

    const sendMessage = () => {
        if (!newMessage.trim() || !socketRef.current || !selectedGroup) return;

        socketRef.current.emit('send_group_message', {
            groupId: selectedGroup._id,
            content: newMessage,
            messageType: 'text'
        });

        setNewMessage('');
        stopTyping();
    };

    const handleLikeMessage = (messageId) => {
        if (!socketRef.current || !selectedGroup) return;

        socketRef.current.emit('like_group_message', {
            messageId,
            groupId: selectedGroup._id
        });
    };

    const startTyping = () => {
        if (!isTyping && socketRef.current && selectedGroup) {
            setIsTyping(true);
            socketRef.current.emit('typing_start', { groupId: selectedGroup._id });
        }
    };

    const stopTyping = () => {
        if (isTyping && socketRef.current && selectedGroup) {
            setIsTyping(false);
            socketRef.current.emit('typing_stop', { groupId: selectedGroup._id });
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (!newGroup.name.trim()) return;

        setIsCreatingGroup(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/groups`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newGroup)
            });

            if (response.ok) {
                const result = await response.json();
                setGroups(prev => [result.group, ...prev]);
                setNewGroup({ name: '', description: '', category: 'General', privacy: 'public' });
                setShowCreateGroupModal(false);
                fetchUserData();
            } else {
                alert('Failed to create group');
            }
        } catch (error) {
            console.error('Create group error:', error);
            alert('Error creating group');
        } finally {
            setIsCreatingGroup(false);
        }
    };

    const handleJoinGroup = async (groupId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/groups/${groupId}/join`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                fetchUserData();
                fetchSuggestedGroups(token);
            } else {
                alert('Failed to join group');
            }
        } catch (error) {
            console.error('Join group error:', error);
            alert('Error joining group');
        }
    };

    const handleCreateFolder = async (e) => {
        e.preventDefault();
        if (!newFolder.name.trim()) return;

        setIsCreatingFolder(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/folders`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newFolder)
            });

            if (response.ok) {
                const result = await response.json();
                setFolders(prev => [result.folder, ...prev]);
                setNewFolder({ name: '', description: '', color: '#3b82f6' });
                setShowCreateFolderModal(false);
                fetchFolders(token);
            } else {
                alert('Failed to create folder');
            }
        } catch (error) {
            console.error('Create folder error:', error);
            alert('Error creating folder');
        } finally {
            setIsCreatingFolder(false);
        }
    };

    const handleCreateNote = async (e) => {
        e.preventDefault();
        if (!newNote.title.trim()) return;

        setIsCreatingNote(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/notes`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newNote)
            });

            if (response.ok) {
                const result = await response.json();
                if (selectedFolder) {
                    fetchNotes(token, selectedFolder._id);
                } else {
                    fetchNotes(token);
                }
                setNewNote({ title: '', content: '', folderId: '', tags: [], color: '#1f2937' });
                setShowCreateNoteModal(false);
            } else {
                alert('Failed to create note');
            }
        } catch (error) {
            console.error('Create note error:', error);
            alert('Error creating note');
        } finally {
            setIsCreatingNote(false);
        }
    };

    const handleDeleteNote = async (noteId) => {
        if (!window.confirm('Are you sure you want to delete this note?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/notes/${noteId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                if (selectedFolder) {
                    fetchNotes(token, selectedFolder._id);
                } else {
                    fetchNotes(token);
                }
            } else {
                alert('Failed to delete note');
            }
        } catch (error) {
            console.error('Delete note error:', error);
            alert('Error deleting note');
        }
    };

    const handleDeleteFolder = async (folderId) => {
        if (!window.confirm('Are you sure you want to delete this folder? All notes will be moved to root.')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/folders/${folderId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                fetchFolders(token);
                if (selectedFolder && selectedFolder._id === folderId) {
                    setSelectedFolder(null);
                    fetchNotes(token);
                }
            } else {
                alert('Failed to delete folder');
            }
        } catch (error) {
            console.error('Delete folder error:', error);
            alert('Error deleting folder');
        }
    };

    const handleSelectFolder = (folder) => {
        const token = localStorage.getItem('token');
        setSelectedFolder(folder);
        if (folder) {
            fetchNotes(token, folder._id);
        } else {
            fetchNotes(token);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, [navigate]);

    useEffect(() => {
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    }, [groupMessages]);

    useEffect(() => {
        if (!user) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(leftStickyRef.current,
                { opacity: 0, x: -30 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.6,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: leftStickyRef.current,
                        start: "top 90%",
                        end: "bottom 10%",
                        toggleActions: "play none none none"
                    }
                }
            )

            const sections = [
                { ref: postsSectionRef, id: 'posts' },
                { ref: groupsSectionRef, id: 'groups' },
                { ref: notesSectionRef, id: 'notes' }
            ];

            sections.forEach((section) => {
                if (section.ref.current) {
                    gsap.fromTo(section.ref.current,
                        {
                            opacity: 0,
                            y: 60
                        },
                        {
                            opacity: 1,
                            y: 0,
                            duration: 0.5,
                            scrollTrigger: {
                                trigger: section.ref.current,
                                start: "top 85%",
                                end: "bottom 15%",
                                toggleActions: "play none none none",
                                onEnter: () => setActiveSection(section.id),
                                onEnterBack: () => setActiveSection(section.id)
                            }
                        }
                    )
                }
            })

            postItemsRef.current.forEach((item) => {
                gsap.fromTo(item,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.4,
                        scrollTrigger: {
                            trigger: item,
                            start: "top 90%",
                            end: "bottom 10%",
                            toggleActions: "play none none none"
                        }
                    }
                )
            })

            groupItemsRef.current.forEach((item) => {
                gsap.fromTo(item,
                    {
                        opacity: 0,
                        x: -50
                    },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.4,
                        scrollTrigger: {
                            trigger: item,
                            start: "top 90%",
                            end: "bottom 10%",
                            toggleActions: "play none none none"
                        }
                    }
                )
            })

            noteItemsRef.current.forEach((item) => {
                gsap.fromTo(item,
                    {
                        opacity: 0,
                        scale: 0.8
                    },
                    {
                        opacity: 1,
                        scale: 1,
                        duration: 0.3,
                        scrollTrigger: {
                            trigger: item,
                            start: "top 95%",
                            end: "bottom 5%",
                            toggleActions: "play none none none"
                        }
                    }
                )
            })

        }, containerRef)

        return () => ctx.revert()
    }, [user])

    const handleCloseGroupModal = () => {
        if (socketRef.current && selectedGroup) {
            socketRef.current.emit('leave_group', selectedGroup._id);
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        setShowGroupModal(false);
        setSelectedGroup(null);
        setGroupMessages([]);
        setTypingUsers([]);
        setOnlineMembers([]);
    };

    const handleProfilePicUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const userId = user.id;
            const formData = new FormData();
            formData.append('profilepic', file);

            const response = await fetch(`${API_BASE}/api/users/${userId}/profilepic`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                setProfilePic(`${API_BASE}${result.profilePicture}?t=${Date.now()}`);
                fetchUserData();
            } else {
                alert('Failed to upload profile picture');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Error uploading profile picture');
        }
    };

    const handleDeleteProfilePic = async () => {
        if (!window.confirm('Are you sure you want to delete your profile picture?')) return;

        try {
            const token = localStorage.getItem('token');
            const userId = user.id;

            const response = await fetch(`${API_BASE}/api/users/${userId}/profilepic`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setProfilePic(`${API_BASE}/uploads/profilepics/DefaultPic.jpeg`);
                fetchUserData();
            } else {
                alert('Failed to delete profile picture');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Error deleting profile picture');
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!postContent.trim()) return;

        setIsCreatingPost(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('content', postContent);

            if (postMedia.length > 0) {
                postMedia.forEach(file => {
                    formData.append('media', file);
                });
            }

            const response = await fetch(`${API_BASE}/api/posts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                setPosts(prev => [result.post, ...prev]);
                setPostContent('');
                setPostMedia([]);
                fetchUserData();
            } else {
                alert('Failed to create post');
            }
        } catch (error) {
            console.error('Create post error:', error);
            alert('Error creating post');
        } finally {
            setIsCreatingPost(false);
        }
    };

    const handlePostMediaUpload = (event) => {
        const files = Array.from(event.target.files);
        if (files.length > 10) {
            alert('Maximum 10 files allowed');
            return;
        }
        setPostMedia(files);
    };

    const handleLikePost = async (postId) => {
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
                setPosts(prev => prev.map(post =>
                    post.id === postId
                        ? { ...post, likes: result.likes, isLiked: result.isLiked }
                        : post
                ));
            }
        } catch (error) {
            console.error('Like post error:', error);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/posts/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setPosts(prev => prev.filter(post => post.id !== postId));
                fetchUserData();
            } else {
                alert('Failed to delete post');
            }
        } catch (error) {
            console.error('Delete post error:', error);
            alert('Error deleting post');
        }
    };

    const addToPostRefs = (el) => {
        if (el && !postItemsRef.current.includes(el)) {
            postItemsRef.current.push(el)
        }
    }

    const addToGroupRefs = (el) => {
        if (el && !groupItemsRef.current.includes(el)) {
            groupItemsRef.current.push(el)
        }
    }

    const addToNoteRefs = (el) => {
        if (el && !noteItemsRef.current.includes(el)) {
            noteItemsRef.current.push(el)
        }
    }

    const scrollToSection = (sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('isAuthenticated');
        navigate('/login');
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const formatMessageTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="min-h-screen bg-black text-white">
            {showCreateGroupModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-xl p-6 w-96 border border-gray-600">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Create New Group</h3>
                            <button onClick={() => setShowCreateGroupModal(false)} className="text-gray-400 hover:text-white">
                                {Icons.close}
                            </button>
                        </div>
                        <form onSubmit={handleCreateGroup} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Group Name"
                                value={newGroup.name}
                                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                                className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-white"
                            />
                            <textarea
                                placeholder="Group Description"
                                value={newGroup.description}
                                onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                                rows="3"
                                className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-white"
                            />
                            <select
                                value={newGroup.privacy}
                                onChange={(e) => setNewGroup({ ...newGroup, privacy: e.target.value })}
                                className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-white"
                            >
                                <option value="public">Public</option>
                                <option value="private">Private</option>
                            </select>
                            <button
                                type="submit"
                                disabled={isCreatingGroup || !newGroup.name.trim()}
                                className="w-full bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCreatingGroup ? 'Creating...' : 'Create Group'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showCreateFolderModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-xl p-6 w-96 border border-gray-600">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Create New Folder</h3>
                            <button onClick={() => setShowCreateFolderModal(false)} className="text-gray-400 hover:text-white">
                                {Icons.close}
                            </button>
                        </div>
                        <form onSubmit={handleCreateFolder} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Folder Name"
                                value={newFolder.name}
                                onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
                                className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-white"
                            />
                            <textarea
                                placeholder="Folder Description"
                                value={newFolder.description}
                                onChange={(e) => setNewFolder({ ...newFolder, description: e.target.value })}
                                rows="3"
                                className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-white"
                            />
                            <button
                                type="submit"
                                disabled={isCreatingFolder || !newFolder.name.trim()}
                                className="w-full bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCreatingFolder ? 'Creating...' : 'Create Folder'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showCreateNoteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-xl p-6 w-96 border border-gray-600">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Create New Note</h3>
                            <button onClick={() => setShowCreateNoteModal(false)} className="text-gray-400 hover:text-white">
                                {Icons.close}
                            </button>
                        </div>
                        <form onSubmit={handleCreateNote} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Note Title"
                                value={newNote.title}
                                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                                className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-white"
                            />
                            <textarea
                                placeholder="Note Content"
                                value={newNote.content}
                                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                                rows="5"
                                className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-white"
                            />
                            <select
                                value={newNote.folderId}
                                onChange={(e) => setNewNote({ ...newNote, folderId: e.target.value })}
                                className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-white"
                            >
                                <option value="">No Folder</option>
                                {folders.map(folder => (
                                    <option key={folder._id} value={folder._id}>{folder.name}</option>
                                ))}
                            </select>
                            <button
                                type="submit"
                                disabled={isCreatingNote || !newNote.title.trim()}
                                className="w-full bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCreatingNote ? 'Creating...' : 'Create Note'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showGroupModal && selectedGroup && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl w-full max-w-6xl h-[90vh] border border-gray-600 flex">
                        <div className="w-1/3 border-r border-gray-700 flex flex-col">
                            <div className="p-6 border-b border-gray-700">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-bold">{selectedGroup.name}</h3>
                                    <button onClick={handleCloseGroupModal} className="text-gray-400 hover:text-white">
                                        {Icons.close}
                                    </button>
                                </div>
                                <p className="text-gray-400 text-sm">{selectedGroup.description}</p>
                            </div>

                            <div className="p-4 border-b border-gray-700">
                                <h4 className="font-bold mb-3">Group Info</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Category:</span>
                                        <span className="text-gray-300">{selectedGroup.category}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Privacy:</span>
                                        <span className="text-gray-300 capitalize">{selectedGroup.privacy}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Members:</span>
                                        <span className="text-gray-300">{selectedGroup.members?.length || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Online:</span>
                                        <span className="text-green-500">{onlineMembers.length}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                <div className="p-4">
                                    <h4 className="font-bold mb-3">Members</h4>
                                    <div className="space-y-3">
                                        {selectedGroup.members?.map(member => (
                                            <div key={member._id} className="flex items-center space-x-3">
                                                <div className="relative">
                                                    <img
                                                        src={`${API_BASE}${member.profilePicture}`}
                                                        alt={member.username}
                                                        className="w-8 h-8 rounded-full object-cover"
                                                    />
                                                    {onlineMembers.some(online => online.userId === member._id) && (
                                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">{member.username}</p>
                                                    <p className="text-xs text-gray-400">
                                                        {onlineMembers.some(online => online.userId === member._id) ? 'Online' : 'Offline'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-2/3 flex flex-col">
                            <div
                                ref={chatMessagesRef}
                                className="flex-1 overflow-y-auto p-4 space-y-4"
                            >
                                {groupMessages.map((message) => (
                                    <div key={message.id} className={`flex ${message.userId === user.id ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-xs lg:max-w-md rounded-lg p-3 ${message.userId === user.id ? 'bg-blue-600' : 'bg-gray-700'}`}>
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className="text-sm font-medium">{message.username}</span>
                                                <span className="text-xs text-gray-300">{formatMessageTime(message.createdAt)}</span>
                                            </div>
                                            <p className="text-white">{message.content}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <button
                                                    onClick={() => handleLikeMessage(message.id)}
                                                    className={`flex items-center space-x-1 text-xs ${message.isLiked ? 'text-red-500' : 'text-gray-400'}`}
                                                >
                                                    {message.isLiked ? Icons.like : Icons.like_outline}
                                                    <span>{message.likes}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {typingUsers.length > 0 && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-700 rounded-lg p-3">
                                            <div className="flex items-center space-x-2">
                                                <div className="flex space-x-1">
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                </div>
                                                <span className="text-sm text-gray-400">
                                                    {typingUsers.map(u => u.username).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-gray-700 p-4">
                                <div className="flex space-x-3">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                sendMessage();
                                            }
                                        }}
                                        onFocus={startTyping}
                                        onBlur={stopTyping}
                                        onInput={startTyping}
                                        placeholder="Type a message..."
                                        className="flex-1 bg-black border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-white"
                                    />
                                    <button
                                        onClick={sendMessage}
                                        disabled={!newMessage.trim()}
                                        className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                    >
                                        {Icons.send}
                                        <span>Send</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex">
                <div className="w-1/4">
                    <div ref={leftStickyRef} className="sticky top-8 bg-black p-8 border-r border-gray-800 min-h-screen">
                        <div className="space-y-8">
                            <div className="text-center border-b border-gray-800 pb-6">
                                <div className="relative inline-block mb-4">
                                    <img
                                        src={profilePic}
                                        alt="Profile"
                                        className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-gray-600"
                                    />
                                    <div className="absolute bottom-0 right-0 flex space-x-1">
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="bg-white text-black p-1 rounded-full hover:bg-gray-200 transition-colors"
                                        >
                                            {Icons.camera}
                                        </button>
                                        {profilePic !== `${API_BASE}/uploads/profilepics/DefaultPic.jpeg` && (
                                            <button
                                                onClick={handleDeleteProfilePic}
                                                className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                                            >
                                                {Icons.trash}
                                            </button>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleProfilePicUpload}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </div>
                                <h1 className="text-2xl font-bold mb-1">{user.username}</h1>
                                <p className="text-gray-400 text-sm">{user.email}</p>
                                <button
                                    onClick={handleLogout}
                                    className="mt-4 w-full bg-white text-black py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                                >
                                    Logout
                                </button>
                            </div>

                            <nav className="space-y-1">
                                {[
                                    { id: 'posts', label: 'Public Posts' },
                                    { id: 'groups', label: 'My Groups' },
                                    { id: 'notes', label: 'Personal Notes' }
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => scrollToSection(item.id)}
                                        className={`w-full text-left p-3 rounded-lg font-medium transition-all flex items-center space-x-3 ${activeSection === item.id
                                            ? 'bg-white text-black'
                                            : 'bg-transparent text-white hover:bg-gray-800'
                                            }`}
                                    >
                                        {Icons[item.id]}
                                        <span>{item.label}</span>
                                    </button>
                                ))}
                            </nav>

                            <div className="bg-gray-800 rounded-lg p-4">
                                <h3 className="font-medium mb-3">Statistics</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Posts</span>
                                        <span className="text-gray-400">{posts.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Groups</span>
                                        <span className="text-gray-400">{groups.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Notes</span>
                                        <span className="text-gray-400">{notes.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Folders</span>
                                        <span className="text-gray-400">{folders.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-3/4">
                    <section ref={postsSectionRef} id="posts" className="min-h-screen border-b border-gray-800 p-8">
                        <div className="max-w-4xl mx-auto">
                            <h2 className="text-4xl font-bold mb-8">Public Posts</h2>

                            <div ref={addToPostRefs} className="bg-gray-800 rounded-xl p-6 mb-8">
                                <h3 className="text-lg font-medium mb-4">Create New Post</h3>
                                <form onSubmit={handleCreatePost} className="space-y-4">
                                    <textarea
                                        value={postContent}
                                        onChange={(e) => setPostContent(e.target.value)}
                                        placeholder="What's on your mind?"
                                        rows="3"
                                        className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-colors"
                                    />
                                    <div className="flex justify-between items-center">
                                        <button
                                            type="button"
                                            onClick={() => postMediaInputRef.current?.click()}
                                            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                                        >
                                            {Icons.media}
                                            <span>Add Media</span>
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isCreatingPost || !postContent.trim()}
                                            className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isCreatingPost ? 'Publishing...' : 'Publish Post'}
                                        </button>
                                    </div>
                                    <input
                                        type="file"
                                        ref={postMediaInputRef}
                                        onChange={handlePostMediaUpload}
                                        accept="image/*,video/*"
                                        multiple
                                        className="hidden"
                                    />
                                    {postMedia.length > 0 && (
                                        <div className="text-sm text-gray-400">
                                            {postMedia.length} file(s) selected
                                        </div>
                                    )}
                                </form>
                            </div>

                            <div className="space-y-6">
                                {posts.length === 0 ? (
                                    <div className="text-center text-gray-400 py-12">
                                        No posts yet. Create your first post!
                                    </div>
                                ) : (
                                    posts.map((post) => (
                                        <div
                                            key={post.id}
                                            ref={addToPostRefs}
                                            className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-500 transition-colors"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center space-x-3">
                                                    <img
                                                        src={`${API_BASE}${post.profilePicture}`}
                                                        alt="Profile"
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                    <div>
                                                        <h3 className="font-bold">{post.username}</h3>
                                                        <p className="text-gray-400 text-sm">{formatTime(post.createdAt)}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeletePost(post.id)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                    title="Delete post"
                                                >
                                                    {Icons.trash}
                                                </button>
                                            </div>
                                            <p className="text-gray-300 mb-4 whitespace-pre-wrap">{post.content}</p>
                                            {post.media && post.media.length > 0 && (
                                                <div className="mb-4 grid grid-cols-2 gap-2">
                                                    {post.media.map((media, index) => (
                                                        <div key={index} className="rounded-lg overflow-hidden">
                                                            {media.mediaType === 'image' ? (
                                                                <img
                                                                    src={`${API_BASE}${media.url}`}
                                                                    alt={`Post media ${index + 1}`}
                                                                    className="w-full h-48 object-cover"
                                                                />
                                                            ) : (
                                                                <video
                                                                    src={`${API_BASE}${media.url}`}
                                                                    className="w-full h-48 object-cover"
                                                                    controls
                                                                />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex justify-between text-sm text-gray-400">
                                                <span>{formatTime(post.createdAt)}</span>
                                                <div className="flex space-x-4">
                                                    <button
                                                        onClick={() => handleLikePost(post.id)}
                                                        className={`flex items-center space-x-1 transition-colors ${post.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-white'
                                                            }`}
                                                    >
                                                        {Icons.like}
                                                        <span>{post.likes}</span>
                                                    </button>
                                                    <span className="flex items-center space-x-1">
                                                        {Icons.comment}
                                                        <span>{post.comments}</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </section>

                    <section ref={groupsSectionRef} id="groups" className="min-h-screen border-b border-gray-800 p-8">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-4xl font-bold">My Groups</h2>
                                <button
                                    onClick={() => setShowCreateGroupModal(true)}
                                    className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center space-x-2"
                                >
                                    {Icons.add}
                                    <span>Create Group</span>
                                </button>
                            </div>

                            {suggestedGroups.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-2xl font-bold mb-4">Suggested Groups</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {suggestedGroups.map((group) => (
                                            <div
                                                key={group._id}
                                                className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-gray-500 transition-colors"
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <h4 className="font-bold text-lg">{group.name}</h4>
                                                    <button
                                                        onClick={() => handleJoinGroup(group._id)}
                                                        className="bg-white text-black px-3 py-1 rounded text-sm font-medium hover:bg-gray-200"
                                                    >
                                                        Join
                                                    </button>
                                                </div>
                                                <p className="text-gray-400 text-sm mb-2">{group.description}</p>
                                                <div className="flex justify-between text-xs text-gray-500">
                                                    <span>{group.members?.length || 0} members</span>
                                                    <span className="capitalize">{group.privacy}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-6">
                                {groups.length === 0 ? (
                                    <div className="col-span-2 text-center text-gray-400 py-12">
                                        No groups yet. Create your first group or join some suggested groups!
                                    </div>
                                ) : (
                                    groups.map((group) => (
                                        <div
                                            key={group._id}
                                            ref={addToGroupRefs}
                                            className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-500 transition-colors cursor-pointer"
                                            onClick={() => {
                                                const token = localStorage.getItem('token');
                                                fetchGroupDetails(group._id, token);
                                            }}
                                        >
                                            <h3 className="text-lg font-bold mb-2">{group.name}</h3>
                                            <p className="text-gray-400 text-sm mb-4">{group.description}</p>
                                            <div className="space-y-2 text-sm text-gray-300">
                                                <div className="flex items-center space-x-2">
                                                    {Icons.members}
                                                    <span>{group.members?.length || 0} members</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <div className={`w-2 h-2 rounded-full ${group.onlineMembers?.length > 0 ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                                                    <span>{group.onlineMembers?.length || 0} online</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {Icons.time}
                                                    <span>Created {new Date(group.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </section>

                    <section ref={notesSectionRef} id="notes" className="min-h-screen p-8">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-4xl font-bold">Personal Notes</h2>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => setShowCreateFolderModal(true)}
                                        className="bg-gray-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center space-x-2"
                                    >
                                        {Icons.folder}
                                        <span>Create Folder</span>
                                    </button>
                                    <button
                                        onClick={() => setShowCreateNoteModal(true)}
                                        className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center space-x-2"
                                    >
                                        {Icons.add}
                                        <span>Create Note</span>
                                    </button>
                                </div>
                            </div>

                            <div className="mb-6">
                                <div className="flex space-x-2 mb-4">
                                    <button
                                        onClick={() => handleSelectFolder(null)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${!selectedFolder ? 'bg-white text-black' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                                    >
                                        All Notes
                                    </button>
                                    {folders.map(folder => (
                                        <button
                                            key={folder._id}
                                            onClick={() => handleSelectFolder(folder)}
                                            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${selectedFolder && selectedFolder._id === folder._id ? 'bg-white text-black' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                                        >
                                            {Icons.folder}
                                            <span>{folder.name} ({folder.noteCount})</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid gap-6">
                                {notes.length === 0 ? (
                                    <div className="text-center text-gray-400 py-12">
                                        {selectedFolder ? `No notes in ${selectedFolder.name} folder.` : 'No notes yet. Create your first note!'}
                                    </div>
                                ) : (
                                    notes.map((note) => (
                                        <div
                                            key={note._id}
                                            ref={addToNoteRefs}
                                            className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-yellow-500 transition-colors"
                                            style={{ borderLeftColor: note.color, borderLeftWidth: '4px' }}
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="text-lg font-bold">{note.title}</h3>
                                                <div className="flex items-center space-x-2">
                                                    {note.isPinned && (
                                                        <span className="flex items-center space-x-1 text-yellow-500 text-sm">
                                                            {Icons.pin}
                                                        </span>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteNote(note._id)}
                                                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                        title="Delete note"
                                                    >
                                                        {Icons.trash}
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-gray-300 mb-4 whitespace-pre-wrap">{note.content}</p>
                                            {note.tags && note.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {note.tags.map((tag, index) => (
                                                        <span key={index} className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex justify-between text-sm text-gray-400">
                                                <div className="flex items-center space-x-4">
                                                    <span>{note.wordCount} words</span>
                                                    {note.folderId && (
                                                        <span className="flex items-center space-x-1">
                                                            {Icons.folder}
                                                            <span>{folders.find(f => f._id === note.folderId)?.name}</span>
                                                        </span>
                                                    )}
                                                </div>
                                                <span>{formatTime(note.lastEdited)}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;