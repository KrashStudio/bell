'use strict';

// Load modules

const Bell = require('../../');
const { expect } = require('code');
const { Server } = require('hapi');
const Hoek = require('hoek');
const Lab = require('lab');
const Mock = require('../mock');


// Test shortcuts

const { describe, it } = exports.lab = Lab.script();


describe('instagram', () => {

    it('authenticates with mock', { parallel: false }, async () => {

        const mock = new Mock.V2();
        mock.start((provider) => {

            const server = Server({ host: 'localhost', port: 80 });
            server.register(Bell, (err) => {

                expect(err).to.not.exist();

                const custom = Bell.providers.instagram();
                Hoek.merge(custom, provider);

                const profile = {
                    meta: { code: 200 },
                    data: { property: 'something' }
                };

                Mock.override('https://api.instagram.com/v1/users/self', profile);

                server.auth.strategy('custom', 'bell', {
                    password: 'cookie_encryption_password_secure',
                    isSecure: false,
                    clientId: 'instagram',
                    clientSecret: 'secret',
                    provider: custom
                });

                server.route({
                    method: '*',
                    path: '/login',
                    config: {
                        auth: 'custom',
                        handler: function (request, h) {

                            return request.auth.credentials;
                        }
                    }
                });

                const res = await server.inject('/login');

                const cookie = res.headers['set-cookie'][0].split(';')[0] + ';';
                mock.server.inject(res.headers.location, (mockRes) => {

                    server.inject({ url: mockRes.headers.location, headers: { cookie } }, (response) => {

                        Mock.clear();
                        expect(response.result).to.equal({
                            provider: 'custom',
                            token: '456',
                            expiresIn: 3600,
                            refreshToken: undefined,
                            query: {},
                            profile: {
                                id: '123456789',
                                username: 'stevegraham',
                                displayName: 'Steve Graham',
                                raw: {
                                    property: 'something'
                                }
                            }
                        });

                        mock.stop(done);
                    });
                });
            });
        });
    });
});

it('authenticates with mock (without extended profile)', { parallel: false }, async () => {

    const mock = new Mock.V2();
    mock.start((provider) => {

        const server = Server({ host: 'localhost', port: 80 });
        server.register(Bell, (err) => {

            expect(err).to.not.exist();

            const custom = Bell.providers.instagram({ extendedProfile: false });
            Hoek.merge(custom, provider);

            server.auth.strategy('custom', 'bell', {
                password: 'cookie_encryption_password_secure',
                isSecure: false,
                clientId: 'instagram',
                clientSecret: 'secret',
                provider: custom
            });

            server.route({
                method: '*',
                path: '/login',
                config: {
                    auth: 'custom',
                    handler: function (request, h) {

                        return request.auth.credentials;
                    }
                }
            });

            const res = await server.inject('/login');

            const cookie = res.headers['set-cookie'][0].split(';')[0] + ';';
            mock.server.inject(res.headers.location, (mockRes) => {

                server.inject({ url: mockRes.headers.location, headers: { cookie } }, (response) => {

                    expect(response.result).to.equal({
                        provider: 'custom',
                        token: '456',
                        expiresIn: 3600,
                        refreshToken: undefined,
                        query: {},
                        profile: {
                            id: '123456789',
                            username: 'stevegraham',
                            displayName: 'Steve Graham',
                            raw: {
                                id: '123456789',
                                username: 'stevegraham',
                                full_name: 'Steve Graham',
                                profile_picture: 'http://distillery.s3.amazonaws.com/profiles/profile_1574083_75sq_1295469061.jpg'
                            }
                        }
                    });

                    mock.stop(done);
                });
            });
        });
    });
});
    });
});
