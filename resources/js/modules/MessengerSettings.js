window.MessengerSettings = (function () {
    var opt = {
        API : '/demo-api/messenger/',
        lock : true,
        elements : {
            profile_avatar_upload : null
        }
    },
    mounted = {
        Initialize : function () {
            $('body').append(templates.avatar_input());
            opt.elements.profile_avatar_upload = document.getElementById('profile_avatar_upload');
            opt.elements.profile_avatar_upload.addEventListener('change', methods.uploadProfileAvatar, false);
            opt.lock = false;
        }
    },
    methods = {
        load : function(){
            if(opt.lock) return;
            TippinManager.alert().Modal({
                backdrop_ctrl : false,
                theme : 'dark',
                icon : 'cog',
                title: 'Loading Settings...',
                pre_loader: true,
                h4: false,
                cb_btn_txt : 'Save Settings',
                cb_btn_icon : 'save',
                cb_btn_theme : 'success',
                onReady: function () {
                    TippinManager.xhr().request({
                        route : opt.API+'get/settings',
                        success : function(data){
                            TippinManager.alert().fillModal({
                                title : 'General Settings',
                                body : templates.settings(data)
                            });
                            PageListeners.listen().tooltips();
                            $(".m_setting_toggle").change(function(){
                                $(this).is(':checked') ? $(this).closest('tr').addClass('bg-light') : $(this).closest('tr').removeClass('bg-light')
                            })
                        }
                    })
                },
                callback : methods.saveSettings
            })
        },
        saveSettings : function(){
            if(opt.lock) return;
            opt.lock = true;
            TippinManager.xhr().payload({
                route : opt.API+'save/settings',
                data : {
                    type : 'settings',
                    message_popups : $("#message_popups").is(":checked"),
                    message_sound : $("#message_sounds").is(":checked"),
                    call_ringtone_sound : $("#call_ringtone_sound").is(":checked"),
                    notify_sound : $("#notify_sound").is(":checked"),
                    knoks : $("#allow_knoks").is(":checked"),
                    calls_outside_networks : $("#allow_all_calls").is(":checked"),
                    friend_approval : $("#friend_approval").is(":checked"),
                    dark_mode : $("#dark_mode").is(":checked"),
                    online_status : parseInt($('input[name="online_status"]:checked').val())
                },
                success : methods.updateSettings,
                fail_alert : true,
                close_modal : true
            });
        },
        updateSettings : function(data){
            if(TippinManager.common().modules.includes('ThreadManager')) ThreadManager.state().statusSetting(data.online_status);
            PageListeners.listen().tooltips();
            if(TippinManager.common().modules.includes('NotifyManager')) NotifyManager.settings(data);
            setTimeout(function () {
                TippinManager.handle().switchCss(data.dark_mode);
            }, 500);
            TippinManager.alert().Alert({
                title : 'Updated your settings',
                toast : true
            })
        },
        uploadProfileAvatar : function () {
            if(opt.lock || !opt.elements.profile_avatar_upload.files.length) return;
            opt.lock = true;
            let data = new FormData();
            data.append('image_file', opt.elements.profile_avatar_upload.files[0]);
            data.append('type', 'store_messenger_avatar');
            PageListeners.listen().disposeTooltips();
            if(!$('#main_modal').length){
                TippinManager.alert().Modal({
                    size : 'sm',
                    icon : 'cloud-upload-alt',
                    pre_loader : true,
                    centered : true,
                    unlock_buttons : false,
                    allow_close : false,
                    backdrop_ctrl : false,
                    title: 'Uploading...',
                    theme: 'primary'
                });
            }
            else{
                TippinManager.alert().fillModal({loader : true, no_close : true, body : null, title : 'Uploading...'});
            }
            TippinManager.xhr().payload({
                route : opt.API+'save/store_messenger_avatar',
                data : data,
                success : methods.manageNewAvatar,
                fail_alert : true,
                close_modal : true
            });
        },
        removeProfileAvatarCheck : function(){
            if(opt.lock) return;
            TippinManager.alert().Modal({
                backdrop_ctrl : false,
                size : 'sm',
                body : false,
                centered : true,
                unlock_buttons : false,
                title: 'Remove Avatar?',
                theme: 'danger',
                cb_btn_txt: 'Remove',
                cb_btn_theme : 'danger',
                cb_btn_icon:'trash',
                icon: 'trash',
                callback : methods.removeProfileAvatar
            })
        },
        removeProfileAvatar : function () {
            TippinManager.xhr().payload({
                route : opt.API+'save/remove_messenger_avatar',
                data : {
                    type : 'remove_messenger_avatar'
                },
                success : methods.manageNewAvatar,
                fail_alert : true,
                close_modal : true
            });
        },
        manageNewAvatar : function (data) {
            TippinManager.forms().updateSlug(data.avatar);
            $('.my-global-avatar').attr('src', data.avatar);
            opt.elements.profile_avatar_upload.value = '';
            TippinManager.alert().Alert({
                toast : true,
                theme : 'success',
                title : 'Your avatar has been updated'
            })
        }
    },
    templates = {
        settings : function(data){
            return '<div class="form-row">\n' +
                '<div class="col-6"><label class="control-label d-block h5 font-weight-bold" for="online_status_switch">Online Status</label>\n' +
                '<div id="online_status_switch" class="btn-group btn-group-toggle" data-toggle="buttons">\n' +
                '<label data-toggle="tooltip" title="Online" data-placement="left" class="pointer_area btn btn-success '+(data.online_status === 1 ? 'active glowing_btn' : '')+'">\n' +
                '<input type="radio" name="online_status" value="1" autocomplete="off" '+(data.online_status === 1 ? 'checked' : '')+'><i class="fas fa-wifi"></i>\n' +
                '</label>\n' +
                '<label data-toggle="tooltip" title="Away" data-placement="bottom" class="pointer_area btn btn-danger '+(data.online_status === 2 ? 'active glowing_btn' : '')+'">\n' +
                '<input type="radio" name="online_status" value="2" autocomplete="off" '+(data.online_status === 2 ? 'checked' : '')+'><i class="fas fa-user-slash"></i>\n' +
                '</label>\n' +
                '<label data-toggle="tooltip" title="Offline" data-placement="right" class="pointer_area btn btn-secondary '+(data.online_status === 0 ? 'active glowing_btn' : '')+'">\n' +
                '<input type="radio" name="online_status" value="0" autocomplete="off" '+(data.online_status === 0 ? 'checked' : '')+'><i class="fas fa-power-off"></i>\n' +
                '</label>\n' +
                '</div></div>\n' +
                '<div class="col-6 mt-1 text-right">' +
                '    <div class="btn-group-vertical mr-1">' +
                '        <button data-toggle="tooltip" data-placement="left" title="Upload New Avatar" onclick="$(\'#profile_avatar_upload\').click()" class="btn btn-sm btn-outline-success"><i class="fas fa-image"></i></button>'+
                '        <button data-toggle="tooltip" data-placement="left" title="Remove Avatar" onclick="MessengerSettings.removeAvatar()" class="btn btn-sm btn-outline-danger"><i class="fas fa-trash"></i></button>' +
                '    </div>'+
                '    <div data-toggle="tooltip" title="Upload New Avatar" data-placement="right" onclick="$(\'#profile_avatar_upload\').click()" class="pointer_area d-inline">\n' +
                '         <img alt="Avatar" height="62" width="62" class="rounded avatar-is-'+(data.online_status === 1 ? "online" : data.online_status === 2 ? "away" : "offline")+'" src="'+TippinManager.common().slug+'"/>\n' +
                '    </div>\n' +
                '</div>' +
                '</div><hr>'+
                '<table class="table mb-0 table-sm table-hover"><tbody>\n' +
                '<tr class="'+(data.message_popups ? 'bg-light' : '')+'">\n' +
                '<td class="pointer_area" onclick="$(\'#message_popups\').click()"><div class="h4 mt-1"><i class="fas fa-caret-right"></i> <span class="h5">Message Popups</span></div></td>\n' +
                '<td><div class="mt-1 float-right"><span class="switch switch-sm mt-1"><input class="switch switch_input m_setting_toggle" id="message_popups" name="message_popups" type="checkbox" '+(data.message_popups ? 'checked' : '')+'/><label for="message_popups"></label></span></div></td>\n' +
                '</tr>\n' +
                '<tr class="'+(data.message_sound ? 'bg-light' : '')+'">\n' +
                '<td class="pointer_area" onclick="$(\'#message_sounds\').click()"><div class="h4 mt-1"><i class="fas fa-caret-right"></i> <span class="h5">Message Sounds</span></div></td>\n' +
                '<td><div class="mt-1 float-right"><span class="switch switch-sm mt-1"><input class="switch switch_input m_setting_toggle" id="message_sounds" name="message_sounds" type="checkbox" '+(data.message_sound ? 'checked' : '')+'/><label for="message_sounds"></label></span></div></td>\n' +
                '</tr>\n' +
                '<tr class="'+(data.call_ringtone_sound ? 'bg-light' : '')+'">\n' +
                '<td class="pointer_area" onclick="$(\'#call_ringtone_sound\').click()"><div class="h4 mt-1"><i class="fas fa-caret-right"></i> <span class="h5">Call Ringtone</span></div></td>\n' +
                '<td><div class="mt-1 float-right"><span class="switch switch-sm mt-1"><input class="switch switch_input m_setting_toggle" id="call_ringtone_sound" name="call_ringtone_sound" type="checkbox" '+(data.call_ringtone_sound ? 'checked' : '')+'/><label for="call_ringtone_sound"></label></span></div></td>\n' +
                '</tr>\n' +
                '<tr class="'+(data.notify_sound ? 'bg-light' : '')+'">\n' +
                '<td class="pointer_area" onclick="$(\'#notify_sound\').click()"><div class="h4 mt-1"><i class="fas fa-caret-right"></i> <span class="h5">Notification Sound</span></div></td>\n' +
                '<td><div class="mt-1 float-right"><span class="switch switch-sm mt-1"><input class="switch switch_input m_setting_toggle" id="notify_sound" name="notify_sound" type="checkbox" '+(data.notify_sound ? 'checked' : '')+'/><label for="notify_sound"></label></span></div></td>\n' +
                '</tr>\n' +
                '<tr class="'+(data.knoks ? 'bg-light' : '')+'">\n' +
                '<td class="pointer_area" onclick="$(\'#allow_knoks\').click()"><div class="h4 mt-1"><i class="fas fa-caret-right"></i> <span class="h5">Receive Knocks</span></div></td>\n' +
                '<td><div class="mt-1 float-right"><span class="switch switch-sm mt-1"><input class="switch switch_input m_setting_toggle" id="allow_knoks" name="allow_knoks" type="checkbox" '+(data.knoks ? 'checked' : '')+'/><label for="allow_knoks"></label></span></div></td>\n' +
                '</tr>\n' +
                '<tr class="'+(data.calls_outside_networks ? 'bg-light' : '')+'">\n' +
                '<td class="pointer_area" onclick="$(\'#allow_all_calls\').click()"><div class="h4 mt-1"><i class="fas fa-caret-right"></i> <span class="h5">Receive calls from non-friends</span></div></td>\n' +
                '<td><div class="mt-1 float-right"><span class="switch switch-sm mt-1"><input class="switch switch_input m_setting_toggle" id="allow_all_calls" name="allow_all_calls" type="checkbox" '+(data.calls_outside_networks ? 'checked' : '')+'/><label for="allow_all_calls"></label></span></div></td>\n' +
                '</tr>\n' +
                '<tr class="'+(data.friend_approval ? 'bg-light' : '')+'">\n' +
                '<td class="pointer_area" onclick="$(\'#friend_approval\').click()"><div class="h4 mt-1"><i class="fas fa-caret-right"></i> <span class="h5">Require Friend Approval</span></div></td>\n' +
                '<td><div class="mt-1 float-right"><span class="switch switch-sm mt-1"><input class="switch switch_input m_setting_toggle" id="friend_approval" name="friend_approval" type="checkbox" '+(data.friend_approval ? 'checked' : '')+'/><label for="friend_approval"></label></span></div></td>\n' +
                '</tr>\n' +
                '<tr class="'+(data.dark_mode ? 'bg-light' : '')+'">\n' +
                '<td class="pointer_area" onclick="$(\'#dark_mode\').click()"><div class="h4 mt-1"><i class="fas fa-caret-right"></i> <span class="h5">Dark Mode</span></div></td>\n' +
                '<td><div class="mt-1 float-right"><span class="switch switch-sm mt-1"><input class="switch switch_input m_setting_toggle" id="dark_mode" name="dark_mode" type="checkbox" '+(data.dark_mode ? 'checked' : '')+'/><label for="dark_mode"></label></span></div></td>\n' +
                '</tr>\n' +
                '</tbody></table>\n'
        },
        avatar_input : function () {
            return '<input style="display: none;" class="NS" id="profile_avatar_upload" type="file" name="profile_avatar_upload" accept="image/*">'
        }
    };
    return {
        init : mounted.Initialize,
        show : methods.load,
        removeAvatar : methods.removeProfileAvatarCheck,
        lock : function(arg){
            if(typeof arg === 'boolean') opt.lock = arg
        }
    };
}());
