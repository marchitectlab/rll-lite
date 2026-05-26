import React, { useRef } from 'react';

interface IconPickerProps {
    selectedValue: string; // This will now be a data URL
    onSelect: (iconDataUrl: string) => void;
}

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

export const IconPicker: React.FC<IconPickerProps> = ({ selectedValue, onSelect }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onSelect(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePickerClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg, image/svg+xml, image/webp"
            />
            <button
                type="button"
                onClick={handlePickerClick}
                className="w-24 h-24 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-600 hover:border-purple-500 transition-colors duration-200 bg-gray-900/50"
                aria-label="Upload an icon"
            >
                {selectedValue ? (
                    <img src={selectedValue} alt="Selected Icon" className="w-full h-full object-cover rounded-md" />
                ) : (
                    <UploadIcon />
                )}
            </button>
        </div>
    );
};