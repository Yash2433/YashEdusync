import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CardMedia,
  Alert,
  CircularProgress
} from '@mui/material';

const VideoPlayer = ({ content }) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const getVideoUrl = () => {
      if (!content?.url) return null;
      
      // If it's a YouTube URL
      if (content.url.includes('youtube.com') || content.url.includes('youtu.be')) {
        const videoId = content.url.includes('youtu.be')
          ? content.url.split('/').pop()
          : new URLSearchParams(new URL(content.url).search).get('v');
        return `https://www.youtube.com/embed/${videoId}`;
      }
      
      // If it's a direct Azure Blob Storage URL
      if (content.url.includes('blob.core.windows.net')) {
        return content.url;
      }
      
      // If it's an API endpoint URL
      if (content.url.includes('/Content/video/')) {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5150';
        // Remove any duplicate /api/ prefixes and ensure single forward slash
        const cleanPath = content.url.replace(/^\/api\/api\//, '/api/').replace(/\/+/g, '/');
        return `${apiUrl}${cleanPath}`;
      }
      
      // For other direct video URLs
      return content.url;
    };

    const url = getVideoUrl();
    console.log('Setting video URL:', url);
    setVideoUrl(url);
  }, [content, retryCount]);

  const handleVideoError = (e) => {
    console.error('Video playback error:', e);
    console.error('Video URL:', videoUrl);
    
    // If we haven't tried the API endpoint yet, retry with it
    if (content?.url?.includes('blob.core.windows.net') && retryCount === 0) {
      console.log('Retrying with API endpoint...');
      setRetryCount(1);
      return;
    }
    
    setError('Failed to load video. Please try again later.');
    setLoading(false);
  };

  const handleVideoLoad = () => {
    console.log('Video loaded successfully');
    setLoading(false);
    setError(null);
  };

  if (!videoUrl) {
    return (
      <Alert severity="error">
        No video URL available for this content.
      </Alert>
    );
  }

  if (videoUrl.includes('youtube.com/embed/')) {
    return (
      <Box sx={{ width: '100%', aspectRatio: '16/9' }}>
        <iframe
          width="100%"
          height="100%"
          src={videoUrl}
          title={content.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onError={handleVideoError}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', aspectRatio: '16/9', position: 'relative' }}>
      {loading && (
        <Box sx={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          zIndex: 1
        }}>
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Alert severity="error" sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2 }}>
          {error}
        </Alert>
      )}
      <video
        key={videoUrl} // Force re-render when URL changes
        controls
        width="100%"
        height="100%"
        style={{ objectFit: 'contain' }}
        onError={handleVideoError}
        onLoadedData={handleVideoLoad}
        preload="auto"
        crossOrigin="anonymous"
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </Box>
  );
};

export default VideoPlayer; 