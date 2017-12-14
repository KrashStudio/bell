'use strict';

exports = module.exports = function (options) {

    options = options || {};
    const uri = 'https://accounts.snapchat.com/login/oauth2';

    return {
        protocol: 'oauth2',
        useParamsAuth: true,
        auth: `${uri}/authorize`,
        token: `${uri}/access_token`,
        scope: ['snapchat-marketing-api'],
        scopeSeparator: ',',
        profile: function (credentials, params, get, callback) {

            /*
               {
                "me": {
                    "id": "2f5dd7e6-fcd1-4324-8455-1ea4d96caaaa",
                    "updated_at": "2016-08-12T01:56:39.841Z",
                    "created_at": "2016-08-12T01:56:39.842Z",
                    "email": "honey.badger@hooli.com",
                    "organization_id": "40d6719b-da09-410b-9185-0cc9c0dfed1d",
                    "display_name": "Honey Badger"
                },
                "request_id": "57ae093a00ff00ff43b8c63fda390001737e616473617069736300016275696c642d34363138393265642d312d31312d32000100"
                }
            */
            get(
                'https://adsapi.snapchat.com/v1/me',
                { access_token: credentials.token },
                (profile) => {

                    credentials.profile.raw = profile.me;
                }
            );
        }
    };
};
