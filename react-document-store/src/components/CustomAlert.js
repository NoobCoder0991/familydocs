

function CustomAlert(props) {
    return (
        <div className="custom-alert-wrapper">

            <div className="custom-alert-container">
                <h2 className="custom-alert-title">
                    Action
                </h2>
                <div className="custom-alert-message">
                    Do you really want to do this action?
                </div>

                <div className="custom-alert-actions">
                    <div className="custom-alert-proceed">Proceed</div>
                    <div className="custom-alert-cancel">Cancel</div>
                </div>
            </div>

        </div>
    )
}

export default CustomAlert