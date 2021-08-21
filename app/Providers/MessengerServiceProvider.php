<?php

namespace App\Providers;

use App\Bots\RecursionBot;
use App\Brokers\JanusBroker;
use App\Models\User;
use Illuminate\Support\ServiceProvider;
use RTippin\Messenger\Facades\Messenger;
use RTippin\Messenger\Facades\MessengerBots;
use RTippin\MessengerBots\Bots\ChuckNorrisBot;
use RTippin\MessengerBots\Bots\CoinTossBot;
use RTippin\MessengerBots\Bots\CommandsBot;
use RTippin\MessengerBots\Bots\DadJokeBot;
use RTippin\MessengerBots\Bots\InsultBot;
use RTippin\MessengerBots\Bots\JokeBot;
use RTippin\MessengerBots\Bots\KanyeBot;
use RTippin\MessengerBots\Bots\KnockBot;
use RTippin\MessengerBots\Bots\LocationBot;
use RTippin\MessengerBots\Bots\QuotableBot;
use RTippin\MessengerBots\Bots\RandomImageBot;
use RTippin\MessengerBots\Bots\ReactionBot;
use RTippin\MessengerBots\Bots\ReplyBot;
use RTippin\MessengerBots\Bots\RockPaperScissorsBot;
use RTippin\MessengerBots\Bots\RollBot;
use RTippin\MessengerBots\Bots\WeatherBot;
use RTippin\MessengerBots\Bots\WikiBot;
use RTippin\MessengerBots\Bots\YoMommaBot;
use RTippin\MessengerBots\Bots\YoutubeBot;

/**
 * Laravel Messenger System.
 * Created by: Richard Tippin.
 * @link https://github.com/RTippin/messenger
 * @link https://github.com/RTippin/messenger-bots
 * @link https://github.com/RTippin/messenger-faker
 * @link https://github.com/RTippin/messenger-ui
 */
class MessengerServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot()
    {
        Messenger::registerProviders([
            User::class,
        ]);

        // Set the video driver of your choosing.
//        Messenger::setVideoDriver(JanusBroker::class);

        // Register the bot handlers you wish to use.
        MessengerBots::registerHandlers([
            ChuckNorrisBot::class,
            CoinTossBot::class,
            CommandsBot::class,
            DadJokeBot::class,
            InsultBot::class,
            JokeBot::class,
            KanyeBot::class,
            KnockBot::class,
            LocationBot::class,
            QuotableBot::class,
            RandomImageBot::class,
            ReactionBot::class,
            RecursionBot::class,
            ReplyBot::class,
            RockPaperScissorsBot::class,
            RollBot::class,
            WeatherBot::class,
            WikiBot::class,
            YoMommaBot::class,
            YoutubeBot::class,
        ]);
    }
}
