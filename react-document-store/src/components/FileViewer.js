import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist"; // Importing PDF.js for handling PDFs

function FileViewer(props) {


    return (
        <div className={`file-viewer-wrapper ${props.fileSrc == null ? 'hide' : ''}`}>
            <div className="file-viewer-container">
                <div className="viewer">
                    {/* For each page, display the corresponding image */}
                    {!props.fileSrc || props.fileSrc.length === 0 ? (
                        <div className="file-loading">Loading...</div>
                    ) : (
                        props.fileSrc.map((src, index) => (
                            <img
                                key={index}
                                className="image viewer-image-element"
                                src={src}
                                alt={`Page ${index + 1}`}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}


export default FileViewer