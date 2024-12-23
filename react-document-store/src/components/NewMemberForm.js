import { useState } from "react";
const API_URL = process.env.NODE_ENV == 'production' ? 'https://familydocs-server.onrender.com' : 'http://localhost:5000'


function NewMemberForm(props) {

    const [newMemberUploading, setNewMemberUploading] = useState(false);

    const addNewMember = async () => {
        if (newMemberUploading) {
            return;
        }

        setNewMemberUploading(true)

        try {
            const name = props.newMemberDetails[1];
            const password = props.newMemberDetails[2];
            const access = props.newMemberDetails[3];
            const response = await fetch(`${API_URL}/new-member`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, password, access }),
                credentials: "include"
            })

            if (response.ok) {
                const data = await response.json();
                if (data.ok == true) {
                    props.setSuccessMessage("Successfully added member");
                    props.setErrorMessage('')
                    props.setFolders((prev) => {
                        let arr = [...prev];
                        arr.push({ name: props.newMemberDetails[1], password: props.newMemberDetails[2], access: props.newMemberDetails[3] });

                        return arr;

                    })
                    props.setMembers((prev) => {
                        let arr = [...prev];
                        arr.push({ member_name: props.newMemberDetails[1], files: [] })
                        return arr;
                    })
                }
                else {
                    props.setErrorMessage(data.errMessage)
                    props.setSuccessMessage('')
                }
            }
            else {
                props.setErrorMessage('Could not send request to the server')
                props.setSuccessMessage('')
            }

        } catch (error) {

            props.setErrorMessage('Some unexpected error occured')
            props.setSuccessMessage('')

        }

        finally {
            setNewMemberUploading(false)
            props.setNewMemberDetails((prev) => {
                let arr = [...prev];
                arr[0] = false;
                arr[1] = '';
                arr[2] = ''
                arr[3] = 'public';
                return arr;
            })

        }

    }
    return (
        <div className={`new-member-wrapper ${props.newMemberDetails[0] === false ? 'hide' : ''}`}>
            <div className="new-member-container">
                <div className="remove-button" onClick={() => {
                    props.setNewMemberDetails((prev) => {
                        let arr = [...prev];
                        arr[0] = false;
                        arr[1] = '';
                        arr[2] = '';
                        arr[3] = 'public'
                        return arr
                    })
                }}>
                    <i className="fas fa-times"></i>
                </div>
                <h2 className="new-member-title">

                    Create a new member
                </h2>
                <div className="new-member-form">
                    <form action="" className="new-member-form" autoComplete="off">
                        <div className="new-member-name">
                            <label htmlFor="name">Name of the member</label>
                            <input autoComplete="false" aria-autocomplete="false"
                                onChange={(event) => {
                                    props.setNewMemberDetails((prev) => {
                                        const updatedDetails = [...prev];
                                        updatedDetails[1] = event.target.value;
                                        return updatedDetails;
                                    });
                                }}
                                type="text"
                                id="name"
                                name="name"
                                placeholder="Name of the member"
                            />
                        </div>

                        <div className="new-member-access">
                            <div>Member access</div>
                            <div className="access-inner">
                                <div className="public-access">
                                    <input
                                        onChange={() => {
                                            props.setNewMemberDetails((prev) => {
                                                const updatedDetails = [...prev];
                                                updatedDetails[3] = 'public';
                                                return updatedDetails;
                                            });
                                        }}
                                        type="radio"
                                        id="public"
                                        name="access"
                                        value="public"
                                    />
                                    <label htmlFor="public">Public</label>
                                </div>
                                <div className="private-access">
                                    <input autoComplete="false"
                                        onChange={() => {
                                            props.setNewMemberDetails((prev) => {
                                                const updatedDetails = [...prev];
                                                updatedDetails[3] = 'private';
                                                return updatedDetails;
                                            });
                                        }}
                                        type="radio"
                                        id="private"
                                        name="access"
                                        value="private"
                                    />
                                    <label htmlFor="private">Private</label>
                                </div>
                            </div>
                        </div>

                        <div className="new-member-password">
                            <label htmlFor="password">Create an Access key for the member</label>
                            <input autoComplete="false"
                                onChange={(event) => {
                                    props.setNewMemberDetails((prev) => {
                                        const updatedDetails = [...prev];
                                        updatedDetails[2] = event.target.value;
                                        return updatedDetails;
                                    });
                                }}
                                type="password"
                                name="password"
                                id="password"
                                placeholder="Password"
                            />
                        </div>

                        <button
                            onClick={addNewMember}
                            className={`new-member-submit ${newMemberUploading ? 'disabled' : ''}`}
                            type="button" // Change to "button" to prevent form submission
                            disabled={newMemberUploading} // Optional, to prevent clicks when uploading
                        >
                            {newMemberUploading ? <div className="loader"></div> : 'Submit'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );


}


export default NewMemberForm