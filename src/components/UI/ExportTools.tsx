import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Download, Camera, Video, FileText } from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';

export const ExportTools: React.FC = () => {
  const { bodies } = useSimulationStore();

  const handleScreenshot = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    // Create a temporary link to download the image
    const link = document.createElement('a');
    link.download = `space-time-simulation-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleVideoRecording = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const stream = canvas.captureStream(30); // 30 FPS
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9'
    });

    const chunks: Blob[] = [];
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `space-time-simulation-${Date.now()}.webm`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    };

    // Record for 10 seconds
    mediaRecorder.start();
    setTimeout(() => {
      mediaRecorder.stop();
    }, 10000);
  };

  const handleDataExport = () => {
    const data = bodies.map(body => ({
      id: body.id,
      name: body.name,
      position: body.position,
      velocity: body.velocity,
      mass: body.mass,
      radius: body.radius,
      color: body.color,
      trail: body.trail
    }));

    const csvContent = [
      'ID,Name,PosX,PosY,PosZ,VelX,VelY,VelZ,Mass,Radius,Color',
      ...data.map(body => 
        `${body.id},${body.name},${body.position[0]},${body.position[1]},${body.position[2]},${body.velocity[0]},${body.velocity[1]},${body.velocity[2]},${body.mass},${body.radius},${body.color}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `simulation-data-${Date.now()}.csv`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="bg-black/80 backdrop-blur-sm border-emerald-500/30 text-emerald-400">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Tools
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={handleScreenshot}
          className="w-full bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30"
          variant="outline"
        >
          <Camera className="h-4 w-4 mr-2" />
          Screenshot (PNG)
        </Button>
        
        <Button
          onClick={handleVideoRecording}
          className="w-full bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
          variant="outline"
        >
          <Video className="h-4 w-4 mr-2" />
          Record Video (10s)
        </Button>
        
        <Button
          onClick={handleDataExport}
          className="w-full bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/30"
          variant="outline"
        >
          <FileText className="h-4 w-4 mr-2" />
          Export Data (CSV)
        </Button>
      </CardContent>
    </Card>
  );
};