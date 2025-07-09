import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button, Card, LinearProgress, Typography } from '@mui/material';
import { CloudUpload, Folder } from '@mui/icons-material';

interface UploadedFile {
  name: string;
  path: string;
  size: number;
  type: string;
}

export default function UploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const mappedFiles = acceptedFiles.map(file => ({
      name: file.name,
      path: (file as any).path || file.name,
      size: file.size,
      type: file.type
    }));
    setFiles(mappedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/javascript': ['.js', '.ts'],
      'text/html': ['.html'],
      'text/css': ['.css'],
      'application/json': ['.json']
    },
    multiple: true
  });

  const handleUpload = async () => {
    setIsUploading(true);
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('files', file as any);
    });

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setProgress(percentCompleted);
        }
      });
      
      const result = await response.json();
      // Handle analysis result
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <Card className="upload-card">
        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
          <input {...getInputProps()} />
          <CloudUpload fontSize="large" />
          <Typography variant="h6">
            {isDragActive ? 'Drop files here' : 'Drag & drop AngularJS files'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Or click to browse files (components, services, templates, configs)
          </Typography>
        </div>

        {files.length > 0 && (
          <div className="file-list">
            {files.map((file, index) => (
              <div key={index} className="file-item">
                <Folder />
                <Typography variant="body1">{file.path}</Typography>
              </div>
            ))}
          </div>
        )}

        {isUploading && (
          <LinearProgress variant="determinate" value={progress} />
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={files.length === 0 || isUploading}
          fullWidth
        >
          Analyze AngularJS Project
        </Button>
      </Card>
    </div>
  );
}