import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';

import {filterImageFromURL, deleteLocalFiles} from './util/util';

(async () => {

    // Init the Express application
    const app = express();

    // Set the network port
    const port = process.env.PORT || 8082;

    // Use the body parser middleware for post requests
    app.use(bodyParser.json());

    app.get("/filteredimage", async (req, res, next) => {
        if ((typeof req === 'object') && req.query.hasOwnProperty('image_url')) {
            if ((typeof req.query['image_url'] === 'string') && req.query['image_url'].length > 0) {
                let filteredpath = filterImageFromURL(req.query['image_url']);

                filteredpath.then((path) => {
                    if (path.length > 0) {
                        res.sendFile(path)
                    } else {
                        res.status(404).send('Not found');
                    }
                }).catch(() => {
                    res.status(500).send('Server error');
                });
            } else {
                res.status(400).send("Bad Request: invalid image_url param ");
            }
        } else {
            res.status(400).send("Bad Request")
        }
        next();
    }, async () => {
        let path = fs.existsSync('./src/util/tmp/') ? './src/util/tmp/' : './tmp/';
        fs.readdir(path, (err, files) => {
            let filesPath = files.map(file => path + file);
            deleteLocalFiles(filesPath);
        });
    });

    // Root Endpoint
    // Displays a simple message to the user
    app.get("/", async (req, res) => {
        res.send("try GET /filteredimage?image_url={{}}")
    });


    // Start the Server
    app.listen(port, () => {
        console.log(`server running http://localhost:${port}`);
        console.log(`press CTRL+C to stop server`);
    });
})();
