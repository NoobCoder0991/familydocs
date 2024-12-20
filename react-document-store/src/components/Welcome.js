

function Welcome(props) {
    return (
        <div className={`welcome ${!props.visible ? 'hide' : ''}`}>
            <h2 className="welcome-title">
                <div className="welcome-title-icon">

                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px">
                        <path fill="#90CAF9" d="M40 45L8 45 8 3 30 3 40 13z" />
                        <path fill="#E1F5FE" d="M38.5 14L29 14 29 4.5z" />
                        <path fill="#1976D2"
                            d="M16 21H33V23H16zM16 25H29V27H16zM16 29H33V31H16zM16 33H29V35H16z" />
                    </svg>
                </div>
                <div className="welcome-title-description">
                    Welcome to DocumentSpace
                </div>
            </h2>
            <div className="welcome-description">
                <div><b>Organize, Secure, and Share Your Family Documents</b></div>
                <div>
                    Welcome to Family Document Manager, a central hub to manage all your family's important
                    documents in one place.

                </div>

                <div>
                    <ul>
                        <li>
                            Public Folders: Share documents that all family members can access.
                        </li>
                        <li>
                            Private Folders: Keep sensitive documents secure and accessible only to you.
                        </li>
                        <li>
                            Customizable Organization: Create, organize, and manage folders tailored to your
                            needs.
                        </li>
                        <li>
                            Easy Upload and Access: Effortlessly upload files, view documents, and stay
                            organized.
                        </li>
                        <li>
                            Simplify your document management today with a user-friendly and secure solution for
                            your family.
                        </li>
                    </ul>
                </div>
            </div>

            <div className="welcome-actions">
                <div className="welcome-action">
                    + Create new member
                </div>
                <div className="welcome-action">
                    + Create new family
                </div>
            </div>
        </div>
    )
}

export default Welcome