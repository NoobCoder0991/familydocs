

function CustomAlert(props) {
    return (
        <div className={`custom-alert-wrapper ${!props.customAlertDetails || props.customAlertDetails.visible == false ? 'hide' : ''}`}>

            <div className="custom-alert-container">
                <h2 className="custom-alert-title">
                    {props.customAlertDetails.title}
                </h2>
                <div className="custom-alert-message">
                    {props.customAlertDetails.message}
                </div>

                <div className="custom-alert-actions">
                    <div onClick={async () => {
                        await props.customAlertDetails.fun();
                        props.setCustomAlertDetails((prev) => {
                            let obj = { ...prev };
                            prev.visible = false;
                            prev.title = '';
                            prev.message = '';
                            prev.proceed = '';
                            prev.fun = function () { }

                            return prev;


                        })
                    }} className={`custom-alert-action custom-alert-proceed ${props.customAlertDetails.warning ? 'custom-alert-warning' : ''}`}>{props.customAlertDetails.proceed || 'Proceed'}</div>
                    <div onClick={() => {
                        props.setCustomAlertDetails((prev) => {
                            let obj = { ...prev };
                            prev.visible = false;
                            prev.title = '';
                            prev.message = '';
                            prev.proceed = '';
                            prev.fun = function () { }

                            return prev;


                        })
                    }} className="custom-alert-action custom-alert-cancel">{props.customAlertDetails.cancel || 'Cancel'}</div>
                </div>
            </div>

        </div>
    )
}

export default CustomAlert