import { useState } from "react";
import Welcome from "./Welcome"

import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

async function getFile(file_id) {
    try {
        const response = await fetch(`https://familydocs-server.onrender.com/files/id`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: file_id }),
            credentials: 'include'
        });

        if (response.ok) {
            const contentType = response.headers.get("Content-Type"); // Get file type
            const reader = response.body.getReader();
            const chunks = [];
            let done = false;

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) {
                    chunks.push(value);
                }
            }

            const blob = new Blob(chunks, { type: contentType })
            const link = URL.createObjectURL(blob)

            return { link, contentType }

            // displayFile(link, contentType);
        } else {

            console.error("Failed to fetch file:", await response.json());
        }
    } catch (error) {
        console.error("Error fetching file:", error);
    }
}

// Function to handle file display based on content type
function displayFile(fileURL, contentType) {
    console.log("Displaying file", fileURL, contentType);

    if (contentType.startsWith("image/") || contentType === "application/pdf") {
        // Open image or PDF in a new tab
        const newTab = window.open(fileURL, "_blank", "noopener,noreferrer");
        if (newTab) {
            newTab.document.write(
                `<html>
                    <head><title>File Preview</title></head>
                    <body style="margin:0; padding:0; display:flex; justify-content:center; align-items:center; height:100vh;">
                        ${contentType.startsWith("image/")
                    ? `<img src="${fileURL}" alt="Fetched File" style="max-width:100%; max-height:100%;"/>`
                    : `<iframe src="${fileURL}" style="width:100%; height:100%; border:none;"></iframe>`
                }
                    </body>
                </html>`
            );
        } else {
            console.error("Failed to open new tab.");
        }
    } else if (contentType.startsWith("text/")) {
        // Fetch the text content and render it in a new tab
        fetch(fileURL)
            .then((res) => res.text())
            .then((text) => {
                const newTab = window.open();
                if (newTab) {
                    newTab.document.write(
                        `<html>
                            <head><title>File Preview</title></head>
                            <body style="margin:0; padding:20px; font-family:monospace; white-space:pre-wrap; word-wrap:break-word;">
                                <pre>${text}</pre>
                            </body>
                        </html>`
                    );
                } else {
                    console.error("Failed to open new tab.");
                }
            })
            .catch((err) => console.error("Failed to fetch text content:", err));
    } else {
        // For other types, initiate a file download
        const link = document.createElement("a");
        link.href = fileURL;
        link.download = "downloaded-file";
        link.click();
    }
}



function FileStructureComponent(props) {

    const [deletingFile, setDeletingFile] = useState(false)
    const [downloadingFile, setDownloadingFile] = useState(false)

    const viewFile = async () => {
        const { link, contentType } = await getFile(props.file_id);
        displayFile(link, contentType);
    };

    const downloadFile = async () => {
        if (downloadingFile) {
            return;
        }

        setDownloadingFile(true)

        try {
            const { link, contentType } = await getFile(props.file_id);

            const downloadLink = document.createElement('a');
            downloadLink.href = link; // Set the link to the Blob URL returned by getFile

            const fileExtension = getFileExtensionFromContentType(contentType);
            const filePreName = `${props.file_name.split(' ').join('_')}`
            const filename = `${filePreName}${fileExtension ? `.${fileExtension}` : ''}`;

            downloadLink.download = filename; // Use the determined filename or a default name

            downloadLink.click();

            URL.revokeObjectURL(link);

        } catch (error) {

            props.setErrorMessage("Could not download file")
            props.setSuccessMessage('')

        }
        finally {
            setDownloadingFile(false)
        }

    };

    const deleteFile = async () => {

        if (deletingFile) {
            return;
        }

        setDeletingFile(false)

        try {

            const response = await fetch("https://familydocs-server.onrender.com/delete-file", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ folder: props.activeFolder, file_id: props.file_id }),
                credentials: 'include'
            })
            if (!response.ok) {
                props.setErrorMessage("Error sending request")
                props.setSuccessMessage('')
            }

            const data = await response.json();
            if (data.ok == true) {


                props.setSuccessMessage('Successfully deleted the message')
                props.setErrorMessage('')
                props.setMembers((prev) => {
                    let arr = [...prev];
                    for (let i = 0; i < arr.length; i++) {
                        const member = arr[i];

                        if (member.member_name == props.activeFolder) {
                            console.log(member.member_name, props.activeFolder)
                            member.files = member.files.filter((file) => {
                                return file.file_id != props.file_id;
                            })

                            break;
                        }
                    }

                    return arr;
                })
            }
            else {
                props.setErrorMessage(data.errMessage)
                props.setSuccessMessage('')
            }

        } catch (error) {
            props.setErrorMessage('Unexpected error occured')
        }
        finally {
            setDeletingFile(false)
        }
    }

    // Helper function to get a file extension from the content type
    const getFileExtensionFromContentType = (contentType) => {
        const extensionMap = {
            'application/pdf': 'pdf',
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'text/plain': 'txt',
            'application/zip': 'zip',
            'application/json': 'json',
            'audio/mpeg': 'mp3',
            'video/mp4': 'mp4',
            'application/msword': 'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
            // Add other content types and their extensions as needed
        };

        return extensionMap[contentType] || ''; // Return the corresponding extension or an empty string
    };



    return (
        <div className="file-structure-component">
            <div className="file-structure-component-name">
                {props.file_name}
            </div>
            <div className="file-structure-component-actions">
                {/* <div onClick={viewFile} className="file-structure-component-action">
                    <i className="fas fa-eye"></i>
                </div> */}
                <div onClick={downloadFile} className="file-structure-component-action download-action">

                    {
                        downloadingFile ? <div className={`center disabled`}> <div className="loader"> </div></div> : <i className="fas fa-download"></i>

                    }
                </div>
                <div onClick={() => {
                    props.setCustomAlertDetails((prev) => {
                        let obj = { ...prev };
                        obj.visible = true
                        obj.title = "Delete File"
                        obj.message = `Do you really want to delete ${props.file_name}`
                        if (deletingFile) {
                            obj.proceed = <div className="center"><div className="loader"></div> &nbsp; Deleting</div>
                        }
                        else {
                            obj.proceed = 'Delete'
                        }
                        // obj.proceed = {`${deletingFile ? <div className="loader"></div> : 'Delete'}`}
                        obj.warning = true;
                        obj.fun = deleteFile
                        return obj
                    })
                }} className={`file-structure-component-action delete-action`}>
                    <i className="fas fa-trash"></i>
                </div>
            </div>
        </div >
    )
}
const fileType = (file) => {
    if (!file) {
        return 'unknown';
    }
    if (file.type.startsWith == 'image/') {
        return 'image'
    }
    if (file.type == 'text/plain') {
        return 'text';
    }
    if (file.type == 'application/pdf') {
        return 'pdf';
    }
    return 'unknown';
}
const getFilePreviewSrc = (file) => {
    return new Promise(async (resolve) => {
        if (!file) {
            resolve('');
            return;
        }

        const fileType = file.type;

        if (fileType.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
        }
        else if (fileType == 'text/plain') {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result)
            reader.readAsText(file)
        }
        else if (file.name.endsWith(".pds")) {
            readPDSFile(file).then((result) => resolve(result)).catch(() => resolve(''))
        }
        else if (fileType === 'application/pdf' || file.name.endsWith('.pdf')) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const pdfData = new Uint8Array(event.target.result);
                try {

                    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
                    const page = await pdf.getPage(1);
                    const viewport = page.getViewport({ scale: 1.5 });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    const renderContext = {
                        canvasContext: context,
                        viewport: viewport,
                    };

                    await page.render(renderContext).promise;
                    resolve(canvas.toDataURL());

                } catch (error) {

                    console.log("Error rendering pdf ", error);
                    resolve('')

                }
            }
            reader.readAsArrayBuffer(file);
        }
        else {
            resolve('');
        }
    })
}

function NewFileSubmitComponent(props) {
    const getStandardSize = (size) => {
        const units = ['B', 'KB', 'MB', 'GB'];
        let index = 0;
        while (size >= 1024 && index < units.length - 1) {
            size = size / 1024;
            index++;
        }
        return (Math.round(size * 100) / 100) + ' ' + units[index];
    };

    const [customFileName, setCustomFileName] = useState('')
    const [newFileUploading, setNewFileUploading] = useState(false)

    const uploadNewFile = async () => {

        if (newFileUploading) {
            return;
        }

        setNewFileUploading(true)

        try {
            const formData = new FormData();
            formData.append("file", props.newFile);
            formData.append('folderName', props.activeFolder);
            formData.append("newFileName", customFileName.length ? customFileName : props.newFile.name);
            formData.append('type', fileType(props.newFile))

            const response = await fetch("https://familydocs-server.onrender.com/upload", {
                method: "POST",
                body: formData, // Pass formData directly
                credentials: 'include' // Include cookies for session
            });

            if (!response.ok) {

                props.setErrorMessage('Error uploading the file');
                props.setSuccessMessage('')

            }
            const data = await response.json();
            if (data.ok == true) {
                props.setSuccessMessage('Uploaded file successfully');
                props.setErrorMessage('');
                props.setMembers(prevMembers => {
                    return prevMembers.map(member => {
                        if (member.member_name === props.activeFolder) {
                            // Return a new object with the updated 'files' array
                            return {
                                ...member,
                                files: [...member.files, { file_name: data.file_name, file_id: data.file_id, type: data.type }]
                            };
                        }
                        return member; // Return the unchanged member
                    });
                });


            }
            else {
                props.setErrorMessage(data.errMessage || 'Unexpected error occured');
                props.setSuccessMessage('')
            }

        } catch (error) {

            console.log("Error", error)

            props.setErrorMessage(error.message || 'Unexpected Error')
            props.setSuccessMessage('')

        }

        finally {
            props.setnewFile(null)
            setNewFileUploading(false)
        }


    }

    return (
        <div className={`new-file-wrapper ${!props.newFile ? 'hide' : ''}`}>
            <div className="new-file-container">
                <h2>Upload File</h2>

                <div className="new-file-original-name">{(props.newFile && props.newFile.name) || ''}</div>
                <div className="new-file-size">{(props.newFile && getStandardSize(props.newFile.size)) || ''}</div>
                <div className="new-file-preview">
                    <img className={`image preview-image ${props.previewSrc && props.previewSrc.length == 0 ? 'hide' : ''}`} src={props && props.previewSrc}></img>
                </div>
                <div className="new-file-details">
                    <div className="new-file-name">
                        <input onChange={(event) => { setCustomFileName(event.target.value) }} className="new-file-name-input" type="text" placeholder="Name of the file (optional)" />
                    </div>

                    <div className="new-file-upload-button">
                        <button onClick={uploadNewFile} className={`new-file-upload-button-element ${newFileUploading ? 'disabled' : ''}`}>
                            {
                                newFileUploading ? (
                                    <div>
                                        <div className="loader"></div>
                                    </div>
                                ) : (
                                    <div>Upload</div>
                                )
                            }
                        </button>

                    </div>
                </div>
                <div className="info">If name is not provided, then the default name of the file will be set.</div>
            </div>

        </div>

    )
}


function RightComponent(props) {

    return (
        <div className={`right-container ${!props.is_active ? 'hide' : ''}`}>
            <div className="right-container-header">
                <div className="back-icon fas fa-arrow-left"></div>
                <div className="right-container-folder">{props.member_name}</div>
            </div>

            <div className="right-container-file-structure">
                <div className="search-document">
                    <input type="text" className="input search-document-input" placeholder="Search documents" />
                </div>
                {
                    props.files.map((file) => (
                        <FileStructureComponent
                            key={file.file_id}
                            file_name={file.file_name}
                            file_id={file.file_id}
                            setFileSrc={props.setFileSrc}
                            setCustomAlertDetails={props.setCustomAlertDetails}
                            setErrorMessage={props.setErrorMessage}
                            setSuccessMessage={props.setSuccessMessage}
                            activeFolder={props.activeFolder}
                            setMembers={props.setMembers}

                        />
                    ))
                }

                <h2 className={`empty-folder ${props && props.files.length ? 'hide' : ''}`}>
                    <span>Nothing Here, start uploading files</span>
                </h2>



            </div>
            <div className="right-container-actions">
                <div className="right-container-action">
                    <input onChange={async (event) => { props.setnewFile(event.target.files[0]); props.setPreviewSrc(await getFilePreviewSrc(event.target.files[0])) }} className="hide" type="file" name="fileInput" id="fileInput" />
                    <label htmlFor="fileInput">+ Upload New File</label>
                </div>
            </div>

        </div>
    )

}

function RightContainer(props) {

    const welcomeVisible = !props.activeFolder;
    const [newFile, setnewFile] = useState(null);
    const [previewSrc, setPreviewSrc] = useState(null);
    const [fileViewer, setFileViewer] = useState(false);

    return (
        <>
            <div className="right">
                <div onClick={() => { props.setSidebarVisibility(!props.sidebarVisibility) }} className={`sidebar-toggle-button sidebar-toggle-button-2 fas fa-bars ${props.sidebarVisibility ? 'hide' : ''}`}></div>
                <Welcome visible={welcomeVisible} />
                {
                    props.members.map(member => (
                        <RightComponent
                            key={member.member_name}
                            member_name={member.member_name}
                            files={member.files}
                            is_active={member.member_name === props.activeFolder}
                            newFile={newFile}
                            setnewFile={setnewFile}
                            previewSrc={previewSrc}
                            setPreviewSrc={setPreviewSrc}
                            setFileSrc={props.setFileSrc}
                            setCustomAlertDetails={props.setCustomAlertDetails}
                            setErrorMessage={props.setErrorMessage}
                            setSuccessMessage={props.setSuccessMessage}
                            activeFolder={props.activeFolder}
                            setMembers={props.setMembers}
                        />
                    ))

                }

                <div className={`${props.activeFolder || props.members.length ? 'hide' : ''}`}>
                    Nothing here
                </div>

                <NewFileSubmitComponent setMembers={props.setMembers} errorMessage={props.errorMessage} setErrorMessage={props.setErrorMessage} successMessage={props.successMessage} setSuccessMessage={props.setSuccessMessage} newFile={newFile} setnewFile={setnewFile} previewSrc={previewSrc} activeFolder={props.activeFolder} />


            </div>

        </>

    )

}

export default RightContainer