import { useState } from "react";
import LeftContainer from "./LeftContainer";
import RightContainer from "./RightContainer";


function Main(props) {
    const [sidebarVisibility, setSidebarVisibility] = useState(true)

    return (
        <div className="main">
            <LeftContainer setNewMemberDetails={props.setNewMemberDetails} setFolders={props.setFolders} sidebarVisibility={sidebarVisibility} setSidebarVisibility={setSidebarVisibility} setActiveFolder={props.setActiveFolder} folders={props.folders} activeFolder={props.activeFolder} />
            <RightContainer setCustomAlertDetails={props.setCustomAlertDetails} setNewMemberDetails={props.setNewMemberDetails} setMembers={props.setMembers} errorMessage={props.errorMessage} setErrorMessage={props.setErrorMessage} successMessage={props.successMessage} setSuccessMessage={props.setSuccessMessage} sidebarVisibility={sidebarVisibility} setSidebarVisibility={setSidebarVisibility} members={props.members} activeFolder={props.activeFolder} setFileSrc={props.setFileSrc} />
        </div>
    )
}

export default Main