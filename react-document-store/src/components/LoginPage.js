import { useState } from "react";
import { useNavigate } from "react-router-dom";


function LoginPage() {
    const navigate = useNavigate()
    const [family_id, setFamilyId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoggingIn, setIsLoggingIn] = useState(false)

    const submitNewMember = async (event) => {

        event.preventDefault(); // Prevent form from submitting automatically
        if (isLoggingIn) {
            return;
        }

        setIsLoggingIn(true)

        // Basic validation to check if both fields are filled
        if (!family_id || !password) {
            setError("Both fields are required.");
            return; // Stop further execution if validation fails
        }

        const payload = { family_id, password };

        try {
            const response = await fetch('http://localhost:5000/family-auth', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                credentials: "include"
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError("Error sending request");
                return;
            }

            const data = await response.json();
            if (data.ok === false) {
                setError(data.errMessage);
            } else {
                setError(""); // Clear the error message on success
                navigate("/")

            }
        } catch (error) {
            setError("Internal server error");
        }
        finally {
            setIsLoggingIn(false)
        }
    };

    return (
        <div className="new-member-wrapper login-wrapper">
            <div className="new-member-container">

                <h2 className="new-member-title">Login to your family</h2>
                <div className="new-member-form">
                    <form onSubmit={submitNewMember} className="new-member-form" autoComplete="off">
                        <div className="new-member-name">
                            <label htmlFor="family_id">Family id</label>
                            <input
                                value={family_id}
                                onChange={(event) => setFamilyId(event.target.value)}
                                required
                                type="text"
                                id="family_id"
                                name="family_id"
                                placeholder="Family id"
                            />
                        </div>

                        <div className="new-member-password">
                            <label htmlFor="password">Password</label>
                            <input
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                required
                                type="password"
                                name="password"
                                id="password"
                                placeholder="Password"
                            />
                        </div>

                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}

                        <button type="submit" className="new-member-submit">
                            {
                                isLoggingIn ? <div className="center disabled"><div className="loader"></div> &nbsp; Submit</div> : 'Submit'
                            }
                        </button>

                        <div className="info">
                            Password provided should be the password related to the family, not your account password.
                        </div>

                        <div className="external-links">
                            <div className="external-link">
                                Create a new family <a href="">here</a>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
