<?php

return [
    /*
    |--------------------------------------------------------------------------
    | The name of your application
    |--------------------------------------------------------------------------
    |
    */
    'site_name' => env('MESSENGER_SITE_NAME', 'Messenger'),

    /*
    |--------------------------------------------------------------------------
    | Provider UUIDs
    |--------------------------------------------------------------------------
    |
    | All of our tables that have relations to one of your providers will use
    | a morphTo. If your providers use UUIDs (char 36) as their primary keys,
    | then set this to true. Please note that if you use multiple providers,
    | they all must have matching primary key types (int / char / etc).
    |
    */
    'provider_uuids' => true,

    /*
    |--------------------------------------------------------------------------
    | Messenger Providers Configuration
    |--------------------------------------------------------------------------
    |
    | Define every model you wish to use within this messenger system.
    | The name provided will be the alias used for that class,
    | including upload folder names, channel names, etc.
    |
    | *PLEASE NOTE: Once you choose an alias, you should not change it
    | unless you plan to move the uploads/directory names around yourself!
    |
    | *Each provider you list must implement our MessengerProvider contract.
    | We also provide a Messagable trait you can use on your model that has
    | the basic methods this messenger needs (name / avatar / etc).
    | -RTippin\Messenger\Traits\Messageable
    | -RTippin\Messenger\Contracts\MessengerProvider
    |
    | *To enable a provider to be searchable, you must implement our contract
    | listed below, and implement the static method for the query builder. We
    | include a trait you can use or reference to jump right in!
    | -RTippin\Messenger\Traits\Search
    | -RTippin\Messenger\Contracts\Searchable
    |
    | *Provider interactions give fine grain control over how your provider can interact with other providers, should you have
    | multiple. A provider always has full permission for interactions between itself, e.g : User to User. To allow full
    | interactions between other providers, simply mark each value as TRUE. For no other interactions, mark NULL or FALSE.
    | To specify which and how each provider can interact with one another, declare each providers alias string, multiple
    | separated by the PIPE, e.g : 'company', 'company|teacher|user', etc.
    |
    | 'company' => [                                  //alias given to your provider
    |     'model' => App\Models\Company::class,       //Path to the provider's model
    |     'searchable' => true,                       //Provider implements/is searchable - true|false
    |     'friendable' => true,                       //Provider is friendable - true|false
    |     'devices' => true,                          //Provider has tokens for push notifications - true|false
    |     'default_avatar' => public_path('pic.png')  //Default avatar path used when provider has no upload avatar
    |     'provider_interactions' => [                //What your provider can do with other providers
    |         'can_message' => 'user',                //Able to start new threads with other listed providers - true|false|null|string
    |         'can_search' => 'user|teacher',         //Able to search other listed providers - true|false|null|string
    |         'can_friend' => false,                  //Able to send friend request to  other listed providers - true|false|null|string
    |     ]
    | ],
    */
    'providers' => [
        'user' => [
            'model' => App\Models\User::class,
            'searchable' => true,
            'friendable' => true,
            'devices' => false,
            'default_avatar' => public_path('vendor/messenger/images/users.png'),
            'provider_interactions' => [
                'can_message' => true,
                'can_search' => true,
                'can_friend' => true,
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Filesystem settings for provider avatars and thread files
    |--------------------------------------------------------------------------
    |
    | For each option below, please seleck the filesystem disk and leading
    | directory you wish you use.
    |
    | *The avatar is where we will store a providers uploaded image. By default,
    | this will store into the storage_path('app/public/images/{alias}/{id}'),
    | given laravels default 'public' disk followed by 'images' directory
    |
    | *The threads option is where a thread avatar, image messages, and document
    | messages will be stored. You should not use the public directory as we
    | will process all files securely though the backend on request.
    |
    | //Thread files
    |
    | **Avatar - {disk}/{directory}/{threadID}/avatar
    | **Images - {disk}/{directory}/{threadID}/images
    | **Documents - {disk}/{directory}/{threadID}/documents
    | **Audio - {disk}/{directory}/{threadID}/audio
    |
    */
    'storage' => [
        'avatars' => [
            'disk' => 'public',
            'directory' => 'images',
        ],
        'threads' => [
            'disk' => 'messenger',
            'directory' => 'threads',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Messenger routing config
    |--------------------------------------------------------------------------
    |
    | Our API is the core of this package, and are the only routes that cannot
    | be disabled. The api routes also bootstrap all of our policies and
    | controllers for you. Our built in middleware 'messenger.provider'
    | simply takes the authenticated user via the request and sets them
    | as the current messenger provider. You are free to use your own
    | custom middleware to set your provider, as well as  any other
    | middleware you may want, such as 'auth:api' etc.
    |
    | All API routes return json, and are best used stateless through
    | auth:api such as passport or sanctum.
    |
    | Invite view / redemption routes for both web and api have individual
    | middleware control so you may allow both guest or authed users to
    | access.
    |
    | *For the broadcasting channels to register, you must have already
    | setup/defined your laravel apps broadcast driver.
    |
    */
    'routing' => [
        'api' => [
            'domain' => null,
            'prefix' => 'api/messenger',
            'middleware' => ['web', 'auth', 'messenger.provider:required'],
            'invite_api_middleware' => ['web', 'auth.optional', 'messenger.provider'],
        ],
        'web' => [
            'enabled' => true,
            'domain' => null,
            'prefix' => 'messenger',
            'middleware' => ['web', 'auth', 'messenger.provider'],
            'invite_web_middleware' => ['web', 'auth.optional', 'messenger.provider'],
        ],
        'provider_avatar' => [
            'enabled' => true,
            'domain' => null,
            'prefix' => 'images',
            'middleware' => ['web', 'cache.headers:public, max-age=86400;'],
        ],
        'channels' => [
            'enabled' => true,
            'domain' => null,
            'prefix' => 'api',
            'middleware' => ['web', 'auth', 'messenger.provider:required'],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | API rate limits / request per minute allowed. Use 0 for unlimited
    |--------------------------------------------------------------------------
    |
    */
    'rate_limits' => [
        'api' => 1000,      // Applies over entire API
        'search' => 45,     // Applies on search
        'message' => 60,    // Applies to sending messages per thread
        'attachment' => 15, // Applies to uploading images/documents per thread
    ],

    /*
    |--------------------------------------------------------------------------
    | Endpoint our javascript will use for socket.io
    |--------------------------------------------------------------------------
    |
    */
    'socket_endpoint' => env('MESSENGER_SOCKET_ENDPOINT', config('app.url')),

    /*
    |--------------------------------------------------------------------------
    | File toggles to enable / disable features and default image paths.
    | Size limits are the max upload size in kilobytes.
    |--------------------------------------------------------------------------
    |
    | *Default thread avatars can be any file type, but the
    | array keys must be left as they are (1 - 5 .png)
    |
    */
    'files' => [
        'message_documents' => [
            'upload' => env('MESSENGER_MESSAGE_DOCUMENT_UPLOAD', true),
            'size_limit' => env('MESSENGER_MESSAGE_DOCUMENT_SIZE_LIMIT', 10240),
            'mime_types' => env('MESSENGER_MESSAGE_DOCUMENT_MIME_TYPES', 'csv,doc,docx,json,pdf,ppt,pptx,rar,rtf,txt,xls,xlsx,xml,zip,7z'),
        ],
        'message_images' => [
            'upload' => env('MESSENGER_MESSAGE_IMAGE_UPLOAD', true),
            'size_limit' => env('MESSENGER_MESSAGE_IMAGE_SIZE_LIMIT', 5120),
            'mime_types' => env('MESSENGER_MESSAGE_IMAGE_MIME_TYPES', 'jpg,jpeg,png,bmp,gif,webp'),
        ],
        'message_audio' => [
            'upload' => env('MESSENGER_MESSAGE_AUDIO_UPLOAD', true),
            'size_limit' => env('MESSENGER_MESSAGE_AUDIO_SIZE_LIMIT', 10240),
            'mime_types' => env('MESSENGER_MESSAGE_AUDIO_MIME_TYPES', 'aac,mp3,oga,ogg,wav,weba,webm'),
        ],
        'thread_avatars' => [
            'upload' => env('MESSENGER_THREAD_AVATAR_UPLOAD', true),
            'size_limit' => env('MESSENGER_THREAD_AVATAR_SIZE_LIMIT', 5120),
            'mime_types' => env('MESSENGER_THREAD_AVATAR_MIME_TYPES', 'jpg,jpeg,png,bmp,gif,webp'),
        ],
        'provider_avatars' => [
            'upload' => env('MESSENGER_PROVIDER_AVATAR_UPLOAD', true),
            'removal' => env('MESSENGER_PROVIDER_AVATAR_REMOVAL', true),
            'size_limit' => env('MESSENGER_PROVIDER_AVATAR_SIZE_LIMIT', 5120),
            'mime_types' => env('MESSENGER_PROVIDER_AVATAR_MIME_TYPES', 'jpg,jpeg,png,bmp,gif,webp'),
        ],
        'default_thread_avatars' => [
            '1.png' => public_path('vendor/messenger/images/1.png'),
            '2.png' => public_path('vendor/messenger/images/2.png'),
            '3.png' => public_path('vendor/messenger/images/3.png'),
            '4.png' => public_path('vendor/messenger/images/4.png'),
            '5.png' => public_path('vendor/messenger/images/5.png'),
        ],
        'default_not_found_image' => public_path('vendor/messenger/images/image404.png'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Calling
    |--------------------------------------------------------------------------
    | Enable or disable the calling feature. If enabled, you must also declare
    | the driver we will use within a boot method from one of your service
    | providers. You may use our messenger facade to set the driver.
    |
    | Messenger::setVideoDriver(JanusBroker::class);
    |
    | We provide an event subscriber to listen and react to calling events. You
    | may choose to enable it, whether it puts jobs on the queue or not, and
    | which queue channel its jobs are dispatched on.
    */
    'calling' => [
        'enabled' => env('MESSENGER_CALLING_ENABLED', false),
        'subscriber' => [
            'enabled' => true,
            'queued' => true,
            'channel' => 'messenger',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | System Messages
    |--------------------------------------------------------------------------
    |
    | Enable or disable system messages. These are messages generated by actions
    | to give feedback in the thread history. Actions such as: call ended, left
    | group, promoted admin, etc.
    |
    | We provide an event subscriber to listen and react to events that will
    | generate the system messages. You may choose to enable it, whether it
    | puts jobs on the queue or not, and which queue channel its jobs are
    | dispatched on.
    */
    'system_messages' => [
        'enabled' => env('MESSENGER_SYSTEM_MESSAGES_ENABLED', true),
        'subscriber' => [
            'enabled' => true,
            'queued' => true,
            'channel' => 'messenger',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Bots
    |--------------------------------------------------------------------------
    |
    | TODO
    */
    'bots' => [
        'enabled' => env('MESSENGER_BOTS_ENABLED', false),
        'subscriber' => [
            'enabled' => true,
            'queued' => true,
            'channel' => 'messenger',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Push Notification Events
    |--------------------------------------------------------------------------
    |
    | Enable or disable firing our push notification event for every broadcast
    | that is not sent over presence. This system only works if you are using
    | our default BroadcastBroker for our broadcast driver.
    */
    'push_notifications' => env('MESSENGER_PUSH_NOTIFICATIONS_ENABLED', false),

    /*
    |--------------------------------------------------------------------------
    | Message Edits
    |--------------------------------------------------------------------------
    |
    | Enable or disable the edit message feature. When enabled, the owner of a
    | message will be allowed to edit that message. A history of the edits will
    | be stored, should you enable our default queued_event_listeners. You may
    | also allow/deny users in a thread to view the edit history of the message.
    |
    */
    'message_edits' => [
        'enabled' => env('MESSENGER_MESSAGE_EDITS_ENABLED', true),
        'history_view' => env('MESSENGER_MESSAGE_EDITS_VIEW_HISTORY', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Message Reactions
    |--------------------------------------------------------------------------
    |
    | Enable or disable the message reactions feature and the max unique allowed
    | per message. This feature behaves similar to discord, where a single user
    | may react to a single message more than once with different emotes.
    |
    */
    'message_reactions' => [
        'enabled' => env('MESSENGER_MESSAGE_REACTIONS_ENABLED', true),
        'max_unique' => env('MESSENGER_MESSAGE_REACTIONS_MAX_UNIQUE', 10),
    ],

    /*
    |--------------------------------------------------------------------------
    | Thread invitations
    |--------------------------------------------------------------------------
    |
    | Enable or disable thread invites. You may also set the max active
    | invites each thread may have at any given time. 0 for unlimited
    |
    */
    'invites' => [
        'enabled' => env('MESSENGER_INVITES_ENABLED', true),
        'max_per_thread' => env('MESSENGER_INVITES_THREAD_MAX', 3),
    ],

    /*
    |--------------------------------------------------------------------------
    | Knock knock!! 👊
    |--------------------------------------------------------------------------
    |
    | Enable or disable knocks, and set the timeout limit (in minutes).
    | Set to 0 for no timeout.
    |
    */
    'knocks' => [
        'enabled' => env('MESSENGER_KNOCKS_ENABLED', true),
        'timeout' => env('MESSENGER_KNOCKS_TIMEOUT', 5),
    ],

    /*
    |--------------------------------------------------------------------------
    | Provider online/away status
    |--------------------------------------------------------------------------
    |
    | Enable or disable showing online/away states, and set the lifetime the
    | status will live in cache (in minutes)
    |
    */
    'online_status' => [
        'enabled' => env('MESSENGER_ONLINE_STATUS_ENABLED', true),
        'lifetime' => env('MESSENGER_ONLINE_STATUS_LIFETIME', 4),
    ],

    /*
    |--------------------------------------------------------------------------
    | Resource collection results limit
    |--------------------------------------------------------------------------
    |
    | Here you can define the default query limits for resource collections
    |
    */
    'collections' => [
        'search' => [
            'page_count' => 25,
        ],
        'threads' => [
            'index_count' => 100,
            'page_count' => 25,
        ],
        'participants' => [
            'index_count' => 500,
            'page_count' => 50,
        ],
        'messages' => [
            'index_count' => 50,
            'page_count' => 50,
        ],
        'calls' => [
            'index_count' => 25,
            'page_count' => 25,
        ],
    ],
];
