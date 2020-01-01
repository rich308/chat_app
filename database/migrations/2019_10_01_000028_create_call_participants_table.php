<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateCallParticipantsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('call_participants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('call_id');
            $table->uuid('owner_id');
            $table->string('owner_type');
            $table->timestamp('left_call')->nullable();
            $table->timestamps();
            $table->foreign('call_id')->references('id')->on('calls')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('call_participants');
    }
}
