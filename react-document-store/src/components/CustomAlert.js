import { useState } from "react";


function CustomAlert(props) {

    const [running, setRunning] = useState(false)

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
                        setRunning(true)
                        await props.customAlertDetails.fun();
                        setRunning(false)
                        props.setCustomAlertDetails((prev) => {
                            let obj = { ...prev };
                            obj.visible = false;
                            obj.title = '';
                            obj.message = '';
                            obj.proceed = '';
                            obj.fun = function () { }

                            return obj;


                        })
                    }} className={`custom-alert-action custom-alert-proceed ${running ? 'disabled' : ''} ${props.customAlertDetails.warning ? 'custom-alert-warning' : ''}`}>{props.customAlertDetails.proceed || 'Proceed'}</div>
                    <div onClick={() => {
                        setRunning(false)
                        props.setCustomAlertDetails((prev) => {
                            let obj = { ...prev };
                            obj.visible = false;
                            obj.title = '';
                            obj.message = '';
                            obj.proceed = '';
                            obj.fun = function () { }

                            return obj;


                        })

                    }} className="custom-alert-action custom-alert-cancel">{props.customAlertDetails.cancel || 'Cancel'}</div>
                </div>
            </div>

        </div>
    )
}

export default CustomAlert