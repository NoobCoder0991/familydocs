import { useState } from "react"



function LeftOption(props) {
    return (
        <div onClick={() => { props.handleClick(props.folder_name) }} className={`left-option ${props.is_folder_active ? 'left-active-option' : ''}`}>
            <div className="left-option-details">
                <div className="icon">
                    <i className="fas fa-folder"></i>
                </div>
                <div className="name">{props.folder_name}</div>
            </div>
            <div className="access-tag public">{props.folder_access}</div>
        </div>
    )
}


function LeftContainer(props) {


    return (
        <div className={`left ${!props.sidebarVisibility ? 'diminish' : ''}`}>

            <div className="container">
                <div onClick={() => { props.setSidebarVisibility(!props.sidebarVisibility) }} className="fas fa-bars sidebar-toggle-button"></div>
                {
                    props.folders.map((folder) => (
                        <LeftOption
                            key={folder.name}
                            handleClick={() => props.setActiveFolder(folder.name)}
                            folder_name={folder.name}
                            folder_access={folder.access}
                            is_folder_active={folder.name === props.activeFolder}
                        />
                    ))
                }


            </div>

            <div className="actions">
                <div
                    onClick={() => {
                        props.setNewMemberDetails((prev) => {
                            let arr = [...prev]
                            arr[0] = true;
                            return arr;
                        })
                    }}
                    className="action">
                    + New Member
                </div>
            </div>

        </div>
    )

}

export default LeftContainer