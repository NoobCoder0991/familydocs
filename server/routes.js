const { ObjectId } = require("mongodb");
const { generateSessionToken } = require("./helper_functions");
const { uploadToGridFS, upload } = require("./uploads");

function handleRoutes(app, db, gfs) {
    app.post('/family-data', async (req, res) => {
        console.log("Requested family data")
        try {
            const sessionId = req.session.sessionId;
            const sessionData = await db.collection("sessionData").findOne({ sessionId })
            if (sessionData) {

                const family_id = sessionData.family_id;
                const data = await db.collection("family-data").findOne({ family_id })
                res.send({ ok: true, data })

            }
            else {
                console.log("Failed, no matching for session id :", sessionId)
                res.send({ ok: false })
            }

        } catch (error) {
            res.send({ ok: false, errMessage: "Internal Server Error" })

        }

    })

    app.post("/upload", upload.single('file'), async (req, res) => {
        try {

            const sessionId = req.session.sessionId;


            // Validate session ID
            if (!sessionId) {
                return res.send({ ok: false, errMessage: "Unauthorized access" });
            }

            // Fetch session data
            const sessionData = await db.collection("sessionData").findOne({ sessionId });
            if (!sessionData) {

                return res.send({ ok: false, errMessage: "User session not found" });
            }

            const family_id = sessionData.family_id;
            const { folderName, newFileName, type } = req.body;

            // Validate inputs
            if (!folderName || !newFileName || !req.file) {
                return res.send({ ok: false, errMessage: "Missing required fields" });
            }

            // Upload file to GridFS
            const fileId = await uploadToGridFS(req.file, gfs);

            // Update folder in the database
            const updateResult = await db.collection("family-data").updateOne(
                { family_id: family_id, "folders.name": folderName },
                { $push: { "folders.$.files": { file_name: newFileName, file_id: fileId, type } } }
            );

            // Check if update was successful
            if (updateResult.matchedCount === 0) {
                return res.send({ ok: false, errMessage: "Folder or family not found" });
            }

            res.send({ ok: true, file_name: newFileName, file_id: fileId, type });

        } catch (error) {
            console.error("Error during upload:", error);
            res.send({ ok: false, errMessage: "Internal Server Error" });
        }
    });


    app.post('/files/id/', async (req, res) => {

        try {
            console.log("Request for file excess with id : ", req.body.id)
            const sessionId = req.session.sessionId;

            console.log("SessionId", sessionId)

            // Validate session ID
            if (!sessionId) {
                console.log("Unauthorized")
                return res.send({ ok: false, errMessage: "Unauthorized access" });
            }

            // Fetch session data
            const sessionData = await db.collection("sessionData").findOne({ sessionId });
            if (!sessionData) {
                console.log("Session expired")
                return res.send({ ok: false, errMessage: "User session not found" });
            }
            const fileId = new ObjectId(req.body.id);

            const files = await gfs.find({ _id: fileId }).toArray();

            if (!files || files.length === 0) {
                console.log("No file exists")
                return res.json({ err: 'No file exists' });
            }

            console.log("Sending file")

            const file = files[0];
            const fileSize = file.length
            res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
            res.setHeader('Content-Type', file.contentType);
            res.setHeader('Content-Length', fileSize);

            const readstream = gfs.openDownloadStream(file._id);
            let byteSent = 0;
            readstream.on('data', (chunk) => {
                byteSent += chunk.length
            })
            readstream.on('error', (err) => {
                console.error('Error in stream:', err);
                res.status(500).json({ err: 'Error fetching file from database' });
            });
            readstream.pipe(res);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ err: 'Internal Server Error' });
        }
    });

    app.post('/family-auth', async (req, res) => {
        try {
            const { family_id, password } = req.body;
            const familyData = await db.collection("families").findOne({ family_id, password });
            if (familyData) {
                console.log("Auth successful")
                const sessionToken = generateSessionToken(16);
                req.session.sessionId = sessionToken;
                console.log("Generated session ", sessionToken)
                console.log("Assigned session ", req.session.sessionId)
                await db.collection("sessionData").insertOne({ family_id, sessionId: sessionToken })

                res.send({ ok: true });
            }
            else {
                console.log("Auth unsuccessful")
                res.send({ ok: false, errMessage: "Invalid Credentials" })
            }

        } catch (error) {

            console.log("Error:", error)

            res.send({ ok: false, errMessage: "Internal Server Error" })

        }

    })

    app.post('/new-member', async (req, res) => {
        try {
            const { name, password, access } = req.body;
            const sessionId = req.session.sessionId;
            const sessionData = await db.collection("sessionData").findOne({ sessionId })

            if (!name || !password || !access) {
                res.send({ ok: false, errMessage: "Incomplete fields" })
            }

            if (sessionData) {

                const family_id = sessionData.family_id;
                const newMember = { name, password, access, files: [] }
                await db.collection("family-data").updateOne({ family_id }, { $push: { folders: newMember } })

                res.send({ ok: true })


            }
            else {
                res.send({ ok: false, errMessage: "Unauthorized" })
            }

        } catch (error) {
            console.log(error)
            res.send({ ok: false, errMessage: "Some error happened on the server" })

        }

    })

    app.post('/delete-file', async (req, res) => {
        try {

            const { folder, file_id } = req.body;

            console.log("Deleting file : ", folder, file_id)
            if (!folder || !file_id) {
                res.send({ ok: false, errMessage: "Incomplete fields" })
            }

            const sessionId = req.session.sessionId;
            const sessionData = await db.collection("sessionData").findOne({ sessionId })

            if (sessionData) {

                const family_id = sessionData.family_id;

                db.collection("family-data").updateOne(
                    {
                        family_id: family_id,
                        "folders.name": folder
                    },
                    {
                        $pull: {
                            "folders.$.files": { file_id: new ObjectId(file_id) }
                        }
                    }
                );

                console.log("Successfully deleted file")

                res.send({ ok: true })
            }
            else {
                res.send({ ok: false, errMessage: "Unauthorized" })
            }


        } catch (error) {

            console.log(error)

            res.send({ ok: false, errMessage: "Internal server error" })

        }
    })





}

module.exports = handleRoutes