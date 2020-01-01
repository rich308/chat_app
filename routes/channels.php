<?php

use App\Broadcasting\CallChannel;
use App\Broadcasting\ThreadChannel;
use App\Broadcasting\UserChannel;
/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('user_notify_{id}', UserChannel::class);

Broadcast::channel('thread_{thread}', ThreadChannel::class);

Broadcast::channel('call_{thread}_{call}', CallChannel::class);
