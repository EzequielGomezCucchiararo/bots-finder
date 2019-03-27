import 'dotenv/config';

import * as Hapi from 'hapi';
import * as Vision from 'vision';
import * as Marko from 'marko';

const server = new Hapi.Server();

server.connection({
    port: process.env.PORT,
    host: 'localhost'
});

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply.view('index');
    }
});

async function init() {
    try {
        await server.register(Vision);
        server.views({
            engines: {
                marko: {
                    compile(src, templateOptions) {
                        const template = Marko.load(templateOptions.filename, src);
                        return (context) => {
                            try {
                                return template.renderToString(context);
                            } catch (error) {
                                const { requestId } = context;
                                console.error(`Error rendering template ${requestId}`, error);
                                throw error;
                            }
                        };
                    },
                },
            },
            relativeTo: __dirname,
            path: 'client/views',
        });
        await server.start();
    } catch(err) {
        throw err;
    }

    console.log('Server started at:', server.info.uri);
}

init().catch(function (err) {
    console.error('err', err);
});