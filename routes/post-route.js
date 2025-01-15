import http from 'http';
import { getRequestBody , cleanupHTMLOutput} from '../utilities.js';
import { dbo } from '../index.js';
import { ObjectId } from 'mongodb';
import fs from 'fs/promises';
import path from 'path';

export async function handlePostRoute (pathSegments, url, request, response){
    let nextSegment = pathSegments.shift();
    if (!nextSegment){

        if (request.method === 'POST'){
            let body = await getRequestBody(request);

            let params = new URLSearchParams(body);
    
            if (!params.get('userName') || !params.get('title')
                || !params.get('bodyText') ){
    
                response.writeHead(400, { 'Content-Type': 'text/plain' });
                response.write('400 Bad Request');
                response.end();
                return;
            }
    
            let result = await dbo.collection('Posts').insertOne({
                'Username': params.get('userName'),
                'Title': params.get('title'),
                'Bodytext': params.get('bodyText')
            });
    
    
            response.writeHead(303, { 'location': '/posts/' + result.insertedId });
            response.end();
            return;
        }

        if (request.method === 'GET'){
            let postsString = '';
            
            for(let i = 0; i < documents.length; i++){
                postsString += '<li><a href="/posts/' 
                + cleanupHTMLOutput(documents[i]._id.toString())
                + '">'
                + cleanupHTMLOutput(documents[i].rubrik)
                + '</a></li>';
            }

            let template = (await fs.readFile('templates/startpage.volvo')).toString();

            template = template.replaceAll('%{postsList}%', postsString);

            response.writeHead(202, {'Content-Type': 'text/html;charset=UTF-8'});
            response.write(template);
            response.end();
            return;
        }

        response.writeHead(405, { 'Content-Type': 'text/plain' });
        response.write('405 Method Not Allowed');
        response.end();
        return;
    }

    if ()


}