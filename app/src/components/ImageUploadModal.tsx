/*  */
import React, { useState } from "react";
import { SERVER_URL } from "../constants/main";

interface ImageUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({ isOpen, onClose }) => {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [title, setTitle] = useState<string>("");

    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) {
            return;
        }
        setFile(files[0]);
        const reader = new FileReader();
        reader.readAsDataURL(files[0]);
        reader.onload = () => {
            setPreviewUrl(reader.result as string);
        };
    };

    const handleTitleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(event.target.value);
    };

    const handleSubmit = async () => {
        // Here you can add your logic for handling the image upload
        console.log("Uploading image with title: ", title);
        const formData = new FormData();
        formData.append("image", file as Blob);
        formData.append("title", title);
        formData.append("token", localStorage.getItem("token") as string);
        try {
            const response = await fetch(SERVER_URL + '/upload', {
                method: "POST",
                body: formData,
            });
            const result = await response.json();
            console.log(result);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className={`fixed inset-0 z-50 ${isOpen ? "" : "hidden"}`}>
            <div className={`fixed inset-0 z-50 ${isOpen ? "" : "hidden"}`}>
                <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
                <div className="fixed inset-0 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                        <h2 className="text-xl font-bold mb-4">Upload Image</h2>
                        <div className="mb-4">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="w-full h-64 object-cover rounded-lg mb-4" />
                            ) : (
                                <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg mb-4">
                                    <p className="text-gray-500 font-bold">No image selected</p>
                                </div>
                            )}
                            <input type="file" onChange={handleFileInputChange} className="hidden" />
                            <button
                                className="bg-indigo-500 text-white py-2 px-4 rounded-lg mr-4 hover:bg-indigo-600 focus:outline-none"
                                onClick={() => {
                                    // @ts-ignore
                                    return document.querySelector("input[type=file]")?.click()
                                }}
                            >
                                Select Image
                            </button>
                            <button
                                className="bg-gray-400 text-white py-2 px-4 rounded-lg hover:bg-gray-500 focus:outline-none"
                                onClick={() => {
                                    setPreviewUrl(null);
                                    setTitle("");
                                }}
                            >
                                Clear
                            </button>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="title" className="block text-gray-700 font-bold mb-2">
                                Title
                            </label>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={handleTitleInputChange}
                                placeholder="Enter a title for the image"
                                className="w-full py-2 px-3 rounded-lg bg-gray-200 border border-gray-200 text-gray-700 focus:outline-none focus:bg-white focus:border-indigo-500"
                            />
                        </div>
                        <div className="flex justify-end">
                            <button className="bg-gray-400 text-white py-2 px-4 rounded-lg mr-4 hover:bg-gray-500 focus:outline-none" onClick={onClose}>
                                Cancel
                            </button>
                            <button className="bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 focus:outline-none" onClick={handleSubmit}>
                                Upload
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageUploadModal;
