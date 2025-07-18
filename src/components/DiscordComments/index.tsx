import React, { useState, useEffect } from 'react';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './styles.module.css';

interface Comment {
  id: number;
  page_url: string;
  page_title: string;
  author_name: string;
  content: string;
  discord_message_id: string;
  discord_channel_id: string;
  created_at: string;
  replies: Reply[];
}

interface Reply {
  id: number;
  discord_message_id: string;
  discord_user_id: string;
  discord_username: string;
  discord_avatar: string;
  discord_roles?: string;
  content: string;
  created_at: string;
}

export default function DiscordComments() {
  const [comment, setComment] = useState('');
  const [author, setAuthor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyForms, setReplyForms] = useState<{[key: number]: {show: boolean, content: string, author: string}}>({});
  const { siteConfig } = useDocusaurusContext();
  const { metadata } = useDoc();
  
  // Get Discord API URL from config or environment
  const commentsConfig = siteConfig.customFields?.comments || {};
  const configApiUrl = commentsConfig.discordApiUrl;

  const apiUrl = configApiUrl || (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) || 'http://localhost:3001';

  const fetchComments = async () => {
    try {
      const currentUrl = window.location.href;
      const encodedUrl = encodeURIComponent(currentUrl);
      const response = await fetch(`${apiUrl}/api/comments/${encodedUrl}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      
      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendToDiscord = async (pageUrl: string, pageTitle: string, authorName: string, content: string) => {
    const response = await fetch(`${apiUrl}/api/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pageUrl,
        pageTitle,
        authorName,
        content,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Failed to send message to Discord');
    }

    return response.json();
  };

  // Load comments on component mount and set up polling
  useEffect(() => {
    fetchComments();
    
    // Poll for new comments/replies every 30 seconds
    const interval = setInterval(fetchComments, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim() || !author.trim()) {
      setSubmitMessage('Please fill in both name and comment fields.');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const currentUrl = window.location.href;
      const pageTitle = metadata.title || 'Documentation Page';
      
      await sendToDiscord(currentUrl, pageTitle, author, comment);
      
      setComment('');
      setAuthor('');
      setSubmitMessage('Comment sent to Discord successfully! 🎉');
      
      // Refresh comments after successful submission
      setTimeout(fetchComments, 2000);
    } catch (error) {
      console.error('Error sending comment to Discord:', error);
      setSubmitMessage('Failed to send comment to Discord. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const toggleReplyForm = (replyId: number) => {
    setReplyForms(prev => ({
      ...prev,
      [replyId]: {
        show: !prev[replyId]?.show,
        content: prev[replyId]?.content || '',
        author: prev[replyId]?.author || ''
      }
    }));
  };

  const updateReplyForm = (replyId: number, field: 'content' | 'author', value: string) => {
    setReplyForms(prev => ({
      ...prev,
      [replyId]: {
        ...prev[replyId],
        [field]: value
      }
    }));
  };

  const submitReply = async (replyId: number, originalReply: Reply) => {
    const replyForm = replyForms[replyId];
    if (!replyForm?.content.trim() || !replyForm?.author.trim()) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          discordMessageId: originalReply.discord_message_id,
          authorName: replyForm.author,
          content: replyForm.content,
        }),
      });

      if (response.ok) {
        // Hide reply form and refresh comments
        setReplyForms(prev => ({
          ...prev,
          [replyId]: { show: false, content: '', author: '' }
        }));
        fetchComments();
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
    }
  };

  return (
    <div className={styles.discordComments}>
      <h3>💬 Discord Community Chat</h3>
      <p>Join the conversation! Comments here sync with our Discord community.</p>
      
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className={styles.commentForm}>
        <div className={styles.formGroup}>
          <label htmlFor="author">Name:</label>
          <input
            id="author"
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Your name"
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="comment">Comment:</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your comment here..."
            rows={4}
            required
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isSubmitting}
          className={styles.submitButton}
        >
          {isSubmitting ? 'Sending...' : 'Send to Discord'}
        </button>
      </form>
      
      {submitMessage && (
        <div className={`${styles.message} ${submitMessage.includes('success') ? styles.success : styles.error}`}>
          {submitMessage}
        </div>
      )}

      {/* Comments and Replies Display */}
      <div className={styles.commentsSection}>
        <h4>💬 Recent Comments</h4>
        {isLoading ? (
          <div className={styles.loading}>Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className={styles.noComments}>
            No comments yet. Be the first to start the conversation!
          </div>
        ) : (
          <div className={styles.commentsList}>
            {comments.map((comment) => (
              <div key={comment.id} className={styles.comment}>
                <div className={styles.commentHeader}>
                  <span className={styles.authorName}>{comment.author_name}</span>
                  <span className={styles.commentDate}>{formatDate(comment.created_at)}</span>
                </div>
                <div className={styles.commentContent}>{comment.content}</div>
                
                {/* Discord Replies */}
                {comment.replies.length > 0 && (
                  <div className={styles.repliesSection}>
                    <h5>💬 Discord Replies</h5>
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className={styles.reply}>
                        <div className={styles.replyHeader}>
                          <div className={styles.discordUser}>
                            {reply.discord_avatar && (
                              <img 
                                src={reply.discord_avatar} 
                                alt={reply.discord_username}
                                className={styles.discordAvatar}
                              />
                            )}
                            <span className={styles.discordUsername}>
                              {reply.discord_username}
                            </span>
                            <span className={styles.discordBadge}>Discord</span>
                          </div>
                          <span className={styles.replyDate}>{formatDate(reply.created_at)}</span>
                        </div>
                        <div className={styles.replyContent}>{reply.content}</div>
                        {reply.discord_roles && (
                          <div className={styles.replyFooter}>
                            <span className={styles.discordRoles}>
                              Discord Roles: {reply.discord_roles}
                            </span>
                          </div>
                        )}
                        <div className={styles.replyActions}>
                          <button
                            className={styles.replyButton}
                            onClick={() => toggleReplyForm(reply.id)}
                          >
                            {replyForms[reply.id]?.show ? 'Cancel' : 'Reply'}
                          </button>
                        </div>
                        
                        {replyForms[reply.id]?.show && (
                          <div className={styles.replyForm}>
                            <div className={styles.replyFormInputs}>
                              <input
                                type="text"
                                placeholder="Your name"
                                value={replyForms[reply.id]?.author || ''}
                                onChange={(e) => updateReplyForm(reply.id, 'author', e.target.value)}
                                className={styles.replyInput}
                              />
                              <textarea
                                placeholder="Your reply..."
                                value={replyForms[reply.id]?.content || ''}
                                onChange={(e) => updateReplyForm(reply.id, 'content', e.target.value)}
                                className={styles.replyTextarea}
                              />
                            </div>
                            <button
                              className={styles.replySubmit}
                              onClick={() => submitReply(reply.id, reply)}
                              disabled={!replyForms[reply.id]?.content.trim() || !replyForms[reply.id]?.author.trim()}
                            >
                              Send Reply
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
