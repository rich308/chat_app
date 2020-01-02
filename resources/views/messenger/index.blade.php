@extends('layouts.app')
@section('title'){{$current_model->name}} - Messenger @endsection
@push('css')<link href="{{ asset("css/emoji/emoji.css?").config('app.version') }}" rel="stylesheet">
    <link href="{{ mix("css/messages.css") }}" rel="stylesheet">
@endpush
@section('content')
<div class="container-fluid mt-n3">
    <div id="messenger_container" class="row inbox d-flex">
        <div id="message_sidebar_container" class="{{request()->is('messenger/*') && $user_agent->isMobile() ? 'NS' : ''}} {{$user_agent->isMobile() ? 'w-100' : 'w-25'}} px-0 h-100">
            <div class="card bg-transparent h-100">
                <div class="card-header bg-white px-1 d-flex justify-content-between">
                    <div id="my_avatar_status">
                        <img data-toggle="tooltip" data-placement="right" title="You are {{$current_model->onlineStatus()}}" class="my-global-avatar ml-1 rounded-circle medium-image avatar-is-{{$current_model->onlineStatus()}}" src="{{$current_model->avatar}}" />
                    </div>
                    <span class="{{$user_agent->isMobile() ? '' : 'd-none d-md-inline'}} h4 font-weight-bold">Messenger</span>
                    <div class="dropdown">
                        <button data-tooltip="tooltip" title="Messenger Options" data-placement="right" class="btn btn-lg text-secondary btn-light pt-1 pb-0 px-2 dropdown-toggle" data-toggle="dropdown"><i class="fas fa-cogs fa-2x"></i></button>
                        <div class="dropdown-menu dropdown-menu-right">
                            <a class="dropdown-item" onclick="ThreadManager.load().createGroup(); return false;" href="#"><i class="fas fa-edit"></i> Create Group</a>
                            <a class="dropdown-item" onclick="ThreadManager.load().contacts(); return false;" href="#"><i class="far fa-address-book"></i> Contacts</a>
                            <a class="dropdown-item" onclick="ThreadManager.load().settings(); return false;" href="#"><i class="fas fa-cog"></i> Settings</a>
                        </div>
                    </div>
                </div>
                <div data-simplebar id="message_sidebar_content" class="card-body bg-transparent px-0 py-0">
                    <div class="col-12 px-2 mx-0 py-0">
                        <div id="socket_error"></div>
                        <div id="threads_search_bar" class="NS my-2">
                            <div class="form-row">
                                <div class="input-group input-group-sm col-12 mb-0">
                                    <div class="input-group-prepend">
                                        <div class="input-group-text"><i class="fas fa-search"></i></div>
                                    </div>
                                    <input type="search" class="form-control shadow-sm" id="thread_search_input" placeholder="Search conversations by name">
                                </div>
                            </div>
                        </div>
                        <div id="allThread">
                            <ul id="messages_ul" class="messages-list">
                                <div class="col-12 mt-5 text-center"><div class="spinner-border spinner-border-sm text-primary" role="status"></div></div>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div id="message_content_container" class="{{$user_agent->isMobile() ? request()->is('messenger/*') ? '' : 'NS' : ''}} {{$user_agent->isMobile() ? 'w-100' : 'w-75'}} flex-fill h-100">
            <div id="message_content_card" class="card h-100">
                <div id="drag_drop_overlay" class="drag_drop_overlay rounded text-center NS">
                    <div class="h-100 d-flex justify-content-center">
                        <div class="align-self-center h1">
                            <span class="badge badge-pill badge-primary"><i class="fas fa-cloud-upload-alt"></i> Drop files to upload</span>
                        </div>
                    </div>
                </div>
                <div id="message_container" class="card-body {{$user_agent->isMobile() ? 'px-1' : 'px-0'}} pb-0 pt-3">
                    <div class="col-12 mt-5 text-center"><div class="spinner-border spinner-border-sm text-primary" role="status"></div></div>
                </div>
            </div>
        </div>
    </div>
</div>
<input style="display: none;" class="NS" id="messenger_avatar_upload" type="file" name="messenger_avatar_upload" accept="image/*">
@stop
