'use client';
import {reducePdfSize} from '@/lib/utils';
import axios from 'axios';
import {File, Inbox} from 'lucide-react';
import React, {useState} from 'react';
import {useDropzone} from 'react-dropzone';
import {Progress} from '@/components/ui/progress';
import {useToast} from './ui/use-toast';
import {useUploadThing} from '@/lib/uploadThing';
import {useMutation} from '@tanstack/react-query';
const FileUpload = () => {
  const {mutate, isLoading} = useMutation({
    mutationFn: async ({fileKey, fileName}: any) => {
      const reponse = axios.post('/api/create-chat', {fileKey, fileName});

      return (await reponse)?.data;
    },
  });
  const [isUploading, setIsUploading] = useState<boolean>(true);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const {startUpload} = useUploadThing('pdfUploader');
  const {toast} = useToast();

  const {getInputProps, getRootProps, acceptedFiles} = useDropzone({
    onDrop: async acceptedFiles => {
      setIsUploading(true);

      const progessInterval = startStimulatedProgress();

      // Handle file upload
      const res = await startUpload(acceptedFiles);

      if (!res) {
        return toast({
          title: 'Error uploading file',
          description: 'Please try again later no response from server',
          variant: 'destructive',
        });
      }

      const [fileResponse] = res;
      const key = fileResponse?.key;
      if (!key) {
        return toast({
          title: 'Error uploading file',
          description: 'Please try again later no Key',
          variant: 'destructive',
        });
      }
      mutate(fileResponse, {
        onSuccess: data => {
          toast({
            title: 'Chat Created',
            description: 'Your file was uploaded successfully',
            variant: 'default',
          });
        },
        onError: (error: any) => {
          console.log(error);
          toast({
            title: 'Error creating chat',
            description: error.message,
            variant: 'destructive',
          });
        },
      });

      clearInterval(progessInterval);
      setUploadProgress(100);
    },
  });
  const startStimulatedProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prevProgress: any) => {
        if (prevProgress >= 95) {
          clearInterval(interval);
          return prevProgress;
        }
        return prevProgress + 5;
      });
    }, 500);

    return interval;
  };
  return (
    <div className="p-2 bg-white rounded-xl">
      <div
        {...getRootProps({
          className:
            'border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col bg-white',
        })}>
        <input {...getInputProps} hidden type="file" id="dropzone-file" />
        <>
          <Inbox className="w-10 h-10 text-blue-500 " />
          <p className="mt-2 text-lg text-gray-500">Drag and drop your file</p>

          {acceptedFiles && acceptedFiles[0] && (
            <div className="max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline-[1px] outline-blue-500 mt-2 divide-x divide-blue-500">
              <div className="px-2 py-2 h-full grid place-items-center">
                <File className="h-4 w-d text-blue-500" />
              </div>
              <div className="px-3 py-2 h-full text-sm truncate">
                {acceptedFiles[0].name}
              </div>
            </div>
          )}
          {isUploading && (
            <div className="w-full mt-4 max-w-xs mx-auto bg-white text-white">
              <Progress
                value={uploadProgress}
                className="h-1 w-full bg-blue-500"
              />
            </div>
          )}
        </>
      </div>
    </div>
  );
};

export default FileUpload;
