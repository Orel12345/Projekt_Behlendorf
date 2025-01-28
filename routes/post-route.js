import http from 'http';
import { getRequestBody, cleanupHTMLOutput } from '../utilities.js';
import { dbo } from '../index.js';
import { ObjectId } from 'mongodb';
import fs from 'fs/promises';
import path from 'path';

export async function handlePostRoute(pathSegments, url, request, response) {
    let nextSegment = pathSegments.shift();
    
    if (!nextSegment) {
        if (request.method === 'POST') {
            let body = await getRequestBody(request);

            let params = new URLSearchParams(body);

            if (!params.get('userName') || !params.get('title')
                || !params.get('bodyText')) {

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

        if (request.method === 'GET') {
            let documents = await dbo.collection('Posts').find().toArray();

            let postsString = '';

            for (let i = 0; i < documents.length; i++) {
                postsString += '<li><a href="/posts/'
                    + cleanupHTMLOutput(documents[i]._id.toString())
                    + '">'
                    + cleanupHTMLOutput(documents[i].Title)
                    + "("
                    + cleanupHTMLOutput(documents[i].Username)
                    + ')</a></li>';
            }

            let template = (await fs.readFile('templates/startpage.volvo')).toString();

            template = template.replaceAll('%{postsList}%', postsString);

            response.writeHead(202, { 'Content-Type': 'text/html;charset=UTF-8' });
            response.write(template);
            response.end();
            return;
        }

        response.writeHead(405, { 'Content-Type': 'text/plain' });
        response.write('405 Method Not Allowed');
        response.end();
        return;
    }

    let nextNextSegment = pathSegments.shift();

    if (!nextNextSegment) {
        if (request.method === 'GET') {
            let postsDocument;

            try {
                postsDocument = await dbo.collection('Posts').findOne({
                    "_id": new ObjectId(nextSegment)
                });
            } catch (e) {
                console.log('Hej1');
                response.writeHead(404, { 'Content-Type': 'text/plain' });
                response.write('404 Not Found');
                response.end();
                return;
            }

            if (!postsDocument) {
                console.log('hej2');
                response.writeHead(404, { 'Content-Type': 'text/plain' });
                response.write('404 Not Found');
                response.end();
                return;
            }

            let template = (await fs.readFile('templates/post.volvo')).toString();
            template = template.replaceAll('%{postId}%', cleanupHTMLOutput(postsDocument._id.toString()));
            template = template.replaceAll('%{userName}%', cleanupHTMLOutput(postsDocument.Username));
            template = template.replaceAll('%{title}%', cleanupHTMLOutput(postsDocument.Title));
            template = template.replaceAll('%{bodyText}%', cleanupHTMLOutput(postsDocument.Bodytext));

            response.writeHead(200, { 'Content-Type': 'text/html;charset=UTF-8' });
            response.write(template);
            response.end();
            return;
        }


        if (request.method === 'DELETE'){

            try{
                await dbo.collection('Posts').deleteOne({
                    "_id": new ObjectId(nextSegment)
                });
            } catch (e){
                console.log('hej3');
                response.writeHead(404, {'Content-Type': 'text/plain'});
                response.write('404 Not Found');
                response.end();
                return;
            }

            response.writeHead(204);
            response.end();
            return;
        }

        if (request.method === 'PUT'){
            let body = await getRequestBody(request);

            let params = new URLSearchParams(body);

            console.log(params);

            if (!params.get('title') || !params.get('bodyText')){
                response.writeHead(400, {'Content-Type': 'text/plain'});
                response.write('400 Bad Request');
                response.end();
                return;
            }

            await dbo.collection('Posts').updateOne({
				"_id": new ObjectId(nextSegment)
			}, {
				'$set':{
					'Title': params.get('title'),
					'Bodytext': params.get('bodyText')
				}
			});

            response.writeHead(204);
            response.end();
            return;
        }

        response.writeHead(405, {'Content-Type': 'text/plain'});
        response.write('405 Method Not Allowed');
        response.end();
        return;
    }

    if (nextNextSegment === 'edit'){
        
        if (request.method === 'GET'){
           
            let postsDocument;
            try{
                postsDocument = await dbo.collection('Posts').findOne({
                    "_id": new ObjectId(nextSegment)
                });
            } catch (e){
                
                response.writeHead(404, {'Content-Type': 'text/plain'});
                response.write('404 Not Found');
                response.end();
                return;
            }

            if(!postsDocument){
               
                response.writeHead(404, { 'Content-Type': 'text/plain' });
				response.write('404 Not Found');
				response.end();
				return;
            }

            let template = (await fs.readFile('templates/edit-post.volvo')).toString();
            template = template.replaceAll('%{postId}%', cleanupHTMLOutput(postsDocument._id.toString()));
            template = template.replaceAll('%{userName}%', cleanupHTMLOutput(postsDocument.Username));
            template = template.replaceAll('%{title}%', cleanupHTMLOutput(postsDocument.Title));
            template = template.replaceAll('%{bodyText}%', cleanupHTMLOutput(postsDocument.Bodytext));

            response.writeHead(200, { 'Content-Type': 'text/html;charset=UTF-8' });
			response.write(template);
			response.end();
			return;
        }

        response.writeHead(405, { 'Content-Type': 'text/plain' });
		response.write('405 Method Not Allowed');
		response.end();
		return;
    }

    console.log('hej6');
    response.writeHead(404, { 'Content-Type': 'text/plain' });
	response.write('404 Not Found');
	response.end();
	return;
}