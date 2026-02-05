"use client"
import React, { useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadIcon } from 'lucide-react';
import { Text } from '@radix-ui/themes';
import clsx from 'clsx';

const baseStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    borderWidth: 2,
    borderRadius: 6,
    borderColor: '#d1d5dc',
    borderStyle: 'dashed',
    backgroundColor: 'white',
    color: 'black',
    outline: 'none',
    transition: 'border .24s ease-in-out'
};

const focusedStyle = {
    borderColor: '#2196f3'
};

const acceptStyle = {
    borderColor: '#00e676'
};

const rejectStyle = {
    borderColor: '#ff1744'
};

type StyledDropzoneProps = {
    fileLimit: number;
    className?: string;
    onFilesAccepted?: (file: File[]) => void;
}

export default function StyledDropzone({ fileLimit, className, onFilesAccepted }: StyledDropzoneProps) {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (onFilesAccepted) {
            onFilesAccepted(acceptedFiles);
        }

    }, [onFilesAccepted]);

    const {
        getRootProps,
        getInputProps,
        isFocused,
        isDragAccept,
        isDragReject,
    } = useDropzone({ accept: { 'image/*': [] }, maxFiles: fileLimit, onDrop });

    const style = useMemo(() => ({
        ...baseStyle,
        ...(isFocused ? focusedStyle : {}),
        ...(isDragAccept ? acceptStyle : {}),
        ...(isDragReject ? rejectStyle : {})
    }), [
        isFocused,
        isDragAccept,
        isDragReject
    ]);

    return (
        <div {...getRootProps({ style })} className={clsx(className, 'cursor-pointer')}>
            <input {...getInputProps()} />
            <div className='flex gap-2 items-center select-none'>
                <UploadIcon width={16} height={16} />
                <Text size={"2"}>Upload files</Text>
            </div>
        </div>
    );
}