import React, { useState } from 'react';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './styles.module.css';

interface DiscordWebhookMessage {
  content: string;
  embeds?: {
    title?: string;
    description?: string;
    color?: number;
    url?: string;
    timestamp?: string;
    author?: {
      name: string;
    };
    fields?: {
      name: string;
      value: string;
      inline?: boolean;
    }[];
  }[];
}

export default function DiscordComments() {
  const [comment, setComment] = useState('');
  const [author, setAuthor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const { siteConfig } = useDocusaurusContext();
  const { metadata } = useDoc();

  const sendToDiscord = async (message: DiscordWebhookMessage) => {
    // Get Discord webhook URL from environment variable
    const webhookUrl = process.env.REACT_APP_DISCORD_WEBHOOK_URL;
    
    if (!webhookUrl) {
      throw new Error('Discord webhook URL not configured');
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error('Failed to send message to Discord');
    }
  };

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
      
      const discordMessage: DiscordWebhookMessage = {
        content: '',
        embeds: [
          {
            title: `New Comment on: ${pageTitle}`,
            description: comment,
            color: 0x5865F2, // Discord blurple color
            url: currentUrl,
            timestamp: new Date().toISOString(),
            author: {
              name: author,
            },
            fields: [
              {
                name: 'Page',
                value: `[${pageTitle}](${currentUrl})`,
                inline: true,
              },
            ],
          },
        ],
      };

      await sendToDiscord(discordMessage);
      
      setComment('');
      setAuthor('');
      setSubmitMessage('Comment sent to Discord successfully! 🎉');
    } catch (error) {
      console.error('Error sending comment to Discord:', error);
      setSubmitMessage('Failed to send comment to Discord. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.discordComments}>
      <h3>💬 Send Comment to Discord</h3>
      <p>Share your thoughts directly with our Discord community!</p>
      
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
    </div>
  );
}
