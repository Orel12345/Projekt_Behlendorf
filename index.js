import 'dotenv/config';
import http from 'http';
import { MongoClient } from 'mongodb';
import { handlePostRoute } from './routes/post-route.js';
import { getRequestBody } from './utilities.js';
import fs from 'fs/promises';

let dbConn = await MongoClient.connect(process.env.MONGODB_CONNECTION_STRING);
export let dbo = dbConn.db(process.env.MONGODB_DATABASE_NAME);

async function handleRequest(request, response){
    let url = new URL(request.url, 'http://' + request.headers.host);
	let path = url.pathname;
	let pathSegments = path.split('/').filter(function (segment) {
		if (segment === '' || segment === '..') {
			return false;
		} else {
			return true;
		}
	});

    let nextSegment = pathSegments.shift();

    if (nextSegment === 'startpage') {
        if (request.method !== 'GET') {
            response.writeHead(405, { 'Content-Type': 'text/plain' });
            response.write('405 Method Not Allowed');
            response.end();
            return;
        }
        let template = (await fs.readFile('templates/startpage.volvo')).toString();

        response.writeHead(200, { 'Content-Type': 'text/html;charset=UTF-8' });
        response.write(template);
        response.end();
        return;
    }

	// kollar nästa segment samt http metoden
	if (nextSegment === 'create-post') {
		if (request.method !== 'GET') {
			response.writeHead(405, { 'Content-Type': 'text/plain' });
			response.write('405 Method Not Allowed');
			response.end();
			return;
		}

		//läser in create post filen och skickar med ett formulär
		let template = (await fs.readFile('templates/create-post.volvo')).toString();

		response.writeHead(200, { 'Content-Type': 'text/html;charset=UTF-8' });
		response.write(template);
		response.end();
		return;
	}

    if (nextSegment === 'posts') {
		await handlePostRoute(pathSegments, url, request, response);
        return;
	}
}

let server = http.createServer(handleRequest);

server.listen(process.env.PORT);

