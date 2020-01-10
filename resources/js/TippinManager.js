window.TippinManager = (function () {
    var opt = {
        initialized : false,
        lockout : false,
        model : 'guest',
        id : null,
        name : null,
        slug : null,
        mobile : false,
        logs : false,
        teapot : 0,
        modal_close : null,
        csrf_token : document.querySelector('meta[name=csrf-token]').content,
        modules : [],
        modal_queue : []
    },
    methods = {
        Initialize : function(arg){
            if(opt.initialized) return;
            opt.initialized = true;
            if("call" in arg) CallManager.init(arg.call);
            if("common" in arg){
                opt.model = arg.common.model;
                opt.id = arg.common.id;
                opt.name = arg.common.name;
                opt.slug = arg.common.slug;
                opt.mobile = arg.common.mobile;
                if('debug' in arg.common) opt.logs = true;
            }
            else{
                opt.model = 'guest';
                opt.id = '1234';
                opt.name = 'Guest User';
                opt.slug = '/images/profile/guest/guest.jpg';
                opt.mobile = false;
            }
            PageListeners.init();
            for(let key in arg.load){
                //We use the manager name to xhr load in the js
                //If loaded, we init and add to modules
                if (!arg.load.hasOwnProperty(key)) continue;
                let obj = arg.load[key];
                XHR.script({
                    file : obj.src,
                    name : key,
                    options : obj,
                    success : function(js){
                        opt.modules.push(js.name);
                        if(typeof window[js.name] !== 'undefined' && typeof window[js.name]['init'] !== 'undefined') window[js.name].init(js.options)
                    }
                })
            }
            for(let key in arg.modules){
                if (!arg.modules.hasOwnProperty(key)) continue;
                let obj = arg.modules[key];
                XHR.script({
                    file : obj.src,
                    name : key,
                    options : obj,
                    success : function(js){
                        opt.modules.push(js.name);
                        if(typeof window[js.name] !== 'undefined' && typeof window[js.name]['init'] !== 'undefined') window[js.name].init(js.options)
                    }
                })
            }
            PageListeners.listen().tooltips()
        },
        LockSmith : function(){
            opt.teapot = 0;
            opt.modules.forEach(function(name){
                if(typeof window[name] !== 'undefined' && typeof window[name]['lock'] !== 'undefined') window[name].lock(false);
            });
        },
        addScripts : function(jsFile){
            let s = document.createElement('script');
            s.type = 'text/javascript';
            s.appendChild(document.createTextNode(jsFile.data));
            document.body.appendChild(s);
        },
        checkCsrfToken : function(token){
            if(opt.csrf_token !== token){
                opt.csrf_token = token;
                window.Laravel = { csrfToken: token };
                window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
                document.querySelector('meta[name=csrf-token]').content = token
            }
        }
    },
    Heartbeat = {
        gather : function(onPass, onFail){
            XHR.request({
                route : '/auth/heartbeat',
                success : Heartbeat.manage,
                shared : {
                    onPass : onPass
                },
                fail : onFail
            })
        },
        update : function(state, onPass, onFail){
            XHR.payload({
                route : '/auth/heartbeat',
                data : {
                    status : state
                },
                success : Heartbeat.manage,
                shared : {
                    onPass : onPass
                },
                fail : onFail
            })
        },
        manage : function (data) {
            methods.checkCsrfToken(data.token);
            if("onPass" in data && typeof data.onPass === 'function'){
                data.onPass(data)
            }
        }
    },
    format = {
        makeUtcLocal : function(date){
            return moment.utc(date).local().format('YYYY-MM-DD HH:mm:ss')
        },
        makeTimeAgo : function(date){
            return moment(format.makeUtcLocal(date)).fromNow()
        },
        escapeHtml : function(text) {
            let map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return text.replace(/[&<>"']/g, function(m) { return map[m]; })
        },
        focusEnd : function (elm, editable) {
            if(!elm) return;
            elm.focus();
            if(editable){
                let range, selection;
                range = document.createRange();
                range.selectNodeContents(elm);
                range.collapse(false);
                selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
            }
            else if(elm.value){
                elm.setSelectionRange(elm.value.length, elm.value.length)
            }
        },
        timeDiffInMinutes : function (date1, date2) {
            if(!date1 || !date2) return 0;
            let d1 = moment(format.makeUtcLocal(date1)),
                d2 = moment(format.makeUtcLocal(date2));
            return d1.diff(d2, 'minutes')
        }
    },
    buttons = {
        addLoader : function(arg){
            let button = $(arg.id);
            if(!button.length) return;
            $(arg.id).append(' <i class="fas fa-sync-alt bLoading"></i>');
            $(arg.id).prop("disabled", true);
        },
        removeLoader : function(){
            $(".bLoading").remove();
            $(".btn").prop("disabled", false);
        }
    },
    alerts = {
        //Global modal module with default options you can override
        // TippinManager.alerts().Modal({
        //     wait_for_others : false, //Default, set true to have modal wait to show until other modals close
        //     title : 'Alert',         //Default, set title of modal
        //     allow_close : true,      //Default, (false) removes btns, user can't close modal
        //     unlock_buttons : true    //Default, if true, removes all btn loaders and disabled states on page
        //     close_btn : true,        //Default, set false to hide bottom close button
        //     theme : 'info',          //Default, bootstrap theme prefix (danger, success, etc)
        //     icon : 'info-sign',      //Default, header Font Awesome icon, use (fas fa-) suffix
        //     size : 'md',             //Default, use bootstrap size prefix (xs, sm, md, ect)
        //     h4 : true,               //Default, makes text in body h4. Set false if importing custom html
        //     backdrop_ctrl : true,    //Default, set false to stop modal close on backdrop click
        //     overflow : false,        //Default, set true to allow inner modal to scroll
        //     close_btn_txt : 'Close', //Default, change close button text
        //     pre_loader : false,      //Default. If true, modal expects a call to the onReady() below (no body set here)
        //     centered : false,        //Default. If true, will center modal in middle of screen
        //     timer : false            //Default, set to int in milliseconds to auto close modal on timeout
        //     body : 'body content',   //Not set, define your modal content here. Set false to hide body completely
        //     callback : function(){   //Optional, requires cb_btn opts below
        //         //your executed callback logic
        //         //by default this will not close modal
        //     },
        //     cb_btn_theme : '',       //Required when using callback, set bootstrap theme prefix
        //     cb_btn_icon : '',        //Required when using callback, Font Awesome icon, use FA suffix
        //     cb_btn_txt : '',         //Required when using callback, set callback btn text
        //     cb_close : true,         //Optional when using callback, set true to make modal close same time when clicking callback
        //     onReady : function(){    //Optional. Execute code here once modal has opened
        //         //execute logic here on modal show
        //         //Required if using pre_loader. You must call in here
        //         //the fillModal({}) method to remove preload, fill body/title
        //         //TippinManager.alerts().fillModal({body : html, title : optional}) Fills in modal
        //      },
        //      onClosed : function(){  //Optional. Run this to execute code once modal closes
        //          //console.log('Modal Closed!');
        //      }
        // });
        loader : function(){
            return '<div class="col-12 my-2 text-center"><div class="spinner-border text-primary" role="status"></div></div>'
        },
        destroyModal : function(){
            $(".modal-backdrop").remove();
            $(".modal").remove();
        },
        Modal : function(arg){
            let elm = {
                modal_backdrop : $(".modal-backdrop"),
                modal : $(".modal")
            },
            defaults = {
                title : 'Alert',
                allow_close : true,
                unlock_buttons : true,
                close_btn : true,
                theme : 'info',
                icon : 'info-circle',
                callback : null,
                size : 'md',
                h4 : true,
                backdrop_ctrl : true,
                overflow : false,
                close_btn_txt : 'Close',
                pre_loader : false,
                centered : false,
                timer : false
            };
            if("wait_for_others" in arg && elm.modal.length){
                opt.modal_queue.push(arg);
                return;
            }
            $(".tooltip").remove();
            if(elm.modal.length || elm.modal_backdrop.length){
                alerts.destroyModal()
            }
            let options = Object.assign({}, defaults, arg),
            bottom = function(options){
                if(!options.allow_close || !options.close_btn){
                    return "";
                }
                if(options.callback){
                    return "<div class='modal-footer'><div class='mx-auto'><button type='button' class='btn btn-md btn-light modal_close' data-dismiss='modal'>Cancel</button>" +
                        "<button id='modal_cb_btn' type='button' class='ml-2 btn btn-md btn-"+options.cb_btn_theme+" modal_callback "+(options.pre_loader ? "NS" : "")+"'><i class='fas fa-"+options.cb_btn_icon+"'></i> "+options.cb_btn_txt+"</button></div></div>";
                }
                return "<div class='modal-footer'><div class='mx-auto'><button type='button' class='btn btn-sm btn-light modal_close' data-dismiss='modal'>"+options.close_btn_txt+"</button></div></div>";
            },
            body = function(options){
                return (options.body || options.pre_loader ? "<div id='body_modal' class='modal-body text-dark "+(options.overflow ? 'modal-scroller' : '')+(options.h4 ? ' h4' : '')+"'>"+(options.pre_loader ? alerts.loader() : options.body)+"</div>" : "");
            },
            template = function(options){
                return "<div id='main_modal' class='modal fade' role='dialog'>" +
                        "<div class='modal-dialog "+(options.centered ? 'modal-dialog-centered' : '')+" modal-"+options.size+"' role='document'>" +
                        "<div class='modal-content'>" +
                        "<div class='modal-header pb-2 text-"+(options.theme === 'warning' ? 'dark' : 'light')+" bg-gradient-"+options.theme+"'>" +
                        "<span class='h5'><i class='fas fa-"+options.icon+"'></i> <strong><span id='title_modal'>"+options.title+"</span></strong></span>" +
                        (options.allow_close ? "<button type='button' class='close modClose' data-dismiss='modal' aria-hidden='true'><i class='fas fa-times'></i></button>" : "" )+
                        "</div>"+body(options)+bottom(options)+"</div></div></div>";
            };
            $("body").append(template(options));
            $("#main_modal").modal({backdrop: (!options.allow_close || !options.backdrop_ctrl ? 'static' : true), keyboard: false})
            .on('shown.bs.modal', function () {
                if(options.timer){
                    opt.modal_close = setTimeout(function(){
                        $(".modal").modal("hide")
                    }, options.timer)
                }
            })
            .on('click', '.modal_callback', function() {
                if(options.callback){
                    if('cb_close' in options) $(".modal").modal("hide");
                    buttons.addLoader({id : $(this)});
                    if('onClosed' in options) options.onClosed();
                    options.callback()
                }
            })
            .on('hidden.bs.modal', function () {
                clearInterval(opt.modal_close);
                $(this).remove();
                if(options.unlock_buttons) buttons.removeLoader();
                if('onClosed' in options) options.onClosed();
                if(opt.modal_queue.length){
                    alerts.Modal(opt.modal_queue[0]);
                    opt.modal_queue.shift()
                }
            });
            if('onReady' in options) options.onReady()
        },
        fillModal : function(arg){
            $("#modal_cb_btn").show();
            $("#body_modal").html(("loader" in arg ? alerts.loader() : arg.body));
            if("title" in arg) $("#title_modal").html(arg.title);
            if("no_close" in arg) $(".modClose, .modal-footer").remove();
        },
        //Global alert popup
        // TippinManager.alert().Alert({
        //     close : false,           //Default, set true to close all open alerts before showing the next including modals
        //     title : 'Alert',         //Default, set title of alert
        //     theme : 'success',       //Default, bootstrap theme prefix (danger, success, etc) / May use success, info, warning, or error is using toast
        //     icon : 'info-sign',      //Default, header Font Awesome icon, use FA suffix
        //     timer : 5000,            //Default, set time until auto close. Set false to not auto close
        //     body : 'body'            //Not set, define your alert content here
        //     toast : false            //If true, we use toastr instead of bootstrap alert and the added options below
        //     close_toast : false      //If true, we close other toast before showing this
        //     toast_options : {        //Default options for toastr, override globals here
        //         https://github.com/CodeSeven/toastr for docs
        //     }
        // });
        Alert : function(arg){
            let defaults = {
                close : false,
                title : 'Alert',
                theme : 'success',
                icon : 'info-circle',
                body : '',
                timer : 5000,
                toast : false,
                close_toast : false,
                toast_options : {}
            },
            options = Object.assign({}, defaults, arg),
            modal = $(".modal");
            if(options.toast){
                if(options.close){
                    modal.modal("hide");
                    $(".alert").remove();
                    buttons.removeLoader()
                }
                if(options.close_toast) toastr.remove();
                toastr[options.theme](options.body, options.title, options.toast_options);
                return;
            }
            buttons.removeLoader();
            modal.modal("hide");
            if(options.close) $(".alert").remove();
            let alert = $('<div onclick="$(this).remove()" role="alert" class="pointer_area alert alert-'+options.theme+' alert-dismissable NS fade show mb-2"><button data-dismiss="alert" type="button" class="close"><i class="fas fa-times"></i></button>' +
                '<strong><i class="fas fa-'+options.icon+'"></i> '+options.title+':</strong> '+options.body+'</div>');
            alert.prependTo("#alert_container");
            alert.css('opacity', '1').slideDown(300, function(){
                if(options.timer){
                    setTimeout( function () {
                        alert.remove()
                    }, options.timer);
                }
            });
        }
    },
    XHR = {
        //Global post/request function using axios
        // TippinManager.xhr().payload({
        //     route : '/post/here',            //(Required)Set the URI to post to
        //     data : {
        //          input : 'data'              //(Required)data is an object of all data to post to URI
        //     },
        //     exports : {                      //(Not Required)if set, it will send data there instead
        //          name : 'ManagerName',       //Manager to call by name string
        //          sub : 'SubFunctionName'     //Manager sub function to call by name string
        //     },
        //     shared : {                       //(Not Required)If set, on success this data will be merged with the
        //          arg : true,                 //received data from the backend
        //          more : 'stuff'
        //     },
        //     success : function(response){    //(Not required) On success, we pass data and run your calls inside success function
        //          console.log(response)
        //     },
        //     fail : function(error){          //(Not Required) if the post fails, it will by default pass the error msg to the handler popup
        //          console.log(error);         //If you set this function, it will instead pass you the error for you to handle
        //          doSomething();
        //     },
        //     bypass : true                    //(Not Required) - Set true if you wish to use your own fail method while continuing
        //                                      //to allow the handler to popup the error message
        //     fail_alert : true                //(Not Required) - Set true if you want error to be in alert and not modal
        //     close_modal : true               //(Not Required) - Set true if you wish close modal on success/fail
        //     lockout : true                   //(Not Required) - Set true to lockout all further post/gets when called
        // });
        payload : function(arg){
            if(opt.lockout) return;
            if("lockout" in arg) opt.lockout = true;
            axios.post(arg.route,arg.data)
            .then(function (response) {
                methods.LockSmith();
                $('.tooltip').remove();
                if('close_modal' in arg) alerts.destroyModal();
                if('exports' in arg){
                    window[arg.exports.name][arg.exports.sub](Object.assign(response.data, arg.exports));
                    return;
                }
                if('success' in arg && typeof arg.success === 'function'){
                    if('shared' in arg){
                        arg.success(Object.assign(response.data, arg.shared));
                        return;
                    }
                    arg.success(response.data);
                }
            })
            .catch(function (error) {
                if(opt.logs){
                    console.trace();
                    console.log(error.response)
                }
                if(error && "response" in error){
                    if(error.response.status === 418){
                        handle.fillTeapot('payload', arg);
                        return;
                    }
                    if(error.response.status === 403){
                        Heartbeat.gather(null, null)
                    }
                }
                $('.tooltip').remove();
                methods.LockSmith();
                buttons.removeLoader();
                if('close_modal' in arg) alerts.destroyModal();
                if('fail' in arg){
                    if(typeof arg.fail === 'function') arg.fail(error.response);
                    if(!('bypass' in arg)) return;
                }
                handle.xhrError({type : ('fail_alert' in arg ? 2 : 1), response : error.response});
            });
        },
        request : function(arg){
            if(opt.lockout) return;
            if("lockout" in arg) opt.lockout = true;
            axios.get(arg.route)
            .then(function (response) {
                $('.tooltip').remove();
                if('close_modal' in arg) alerts.destroyModal();
                methods.LockSmith();
                if('exports' in arg){
                    window[arg.exports.name][arg.exports.sub](Object.assign(response.data, arg.exports));
                    return;
                }
                if('success' in arg && typeof arg.success === 'function'){
                    if('shared' in arg){
                        arg.success(Object.assign(response.data, arg.shared));
                        return;
                    }
                    arg.success(response.data);
                }
            })
            .catch(function (error) {
                if(opt.logs){
                    console.trace();
                    console.log(error.response)
                }
                if(error && "response" in error && error.response.status === 418){
                    handle.fillTeapot('request', arg);
                    return;
                }
                $('.tooltip').remove();
                methods.LockSmith();
                buttons.removeLoader();
                if('close_modal' in arg) alerts.destroyModal();
                if('fail' in arg){
                    if(typeof arg.fail === 'function') arg.fail(error.response);
                    if(!('bypass' in arg)) return;
                }
                handle.xhrError({type : ('fail_alert' in arg ? 2 : 1), response : error.response});
            });
        },
        script : function(arg){
            if(!opt.initialized) return;
            if(opt.lockout) return;
            if("lockout" in arg) opt.lockout = true;
            axios.get(arg.file)
            .then(function(response) {
                methods.addScripts(response);
                if("success" in arg) arg.success(arg);
            })
            .catch(function(error) {
                if(opt.logs){
                    console.trace();
                    console.log(error.response)
                }
                console.log('Failed to load '+arg.file);
                if("fail" in arg) arg.fail();
            })
        }
    },
    handle = {
        fillTeapot : function(flavor, tea){
            if(opt.teapot > 4){
                handle.xhrError();
                return;
            }
            opt.teapot++;
            XHR[flavor](tea)
        },
        xhrError : function(arg){
            $('body').find("input[type!='hidden'], textarea, select, .btn").prop('disabled', false);
            let errMessages = function(){
                switch(Math.floor(Math.random() * Math.floor(3))){
                    case 0: return 'Your request has encountered an error. We have been made aware of this issue';
                    case 1: return 'It seems we are having trouble processing your request. Our team has been notified';
                    case 2: return 'Something went wrong. We are sorry about that, our team has been informed of the situation';
                }
            },
            errToast = function(body, close){
                alerts.Alert({
                    close_toast : close,
                    close : close,
                    toast : true,
                    theme : 'error',
                    title : body
                })
            },
            errModal = function(body){
                alerts.Modal({
                    theme : 'danger',
                    icon : 'times',
                    title : 'Error',
                    body : body
                })
            };
            buttons.removeLoader();
            if(!arg || arg && typeof arg.response === 'undefined'){
                errToast(errMessages(), true);
                return;
            }
            if(arg.response.status === 401 || arg.response.status === 403){
                errToast('Your request was denied. You may try again, or reload the page as your session may have changed', true);
                if(arg.response.status === 401){
                    setTimeout(function () {
                        window.location.replace('/')
                    }, 1500)
                }
                return;
            }
            if(arg.response.status === 413){
                errToast('File upload too large', true);
                return;
            }
            if( typeof arg.response.data === 'undefined' ||
                typeof arg.response.data.errors === 'undefined' ||
                typeof arg.response.data.errors.forms === 'undefined'){
                errToast(errMessages(), true);
                return;
            }
            if(typeof arg.response.data.errors.forms === 'object'){
                let theStack = '<ul class="'+(arg.type === 2 ? 'p-0 ml-3' : '')+'">';
                $.each( arg.response.data.errors.forms, function( key, value ) {
                    $.each( value, function( key2, errm ) {
                        theStack += '<li>' + errm + '</li>';
                    });
                });
                theStack += '</ul>';
                if(arg.type === 2){
                    errToast(theStack, !("no_close" in arg));
                    return;
                }
                errModal(theStack);
                return;
            }
            if(arg.type === 2){
                errToast(arg.response.data.errors.forms, true);
                return;
            }
            errModal(arg.response.data.errors.forms);
        }
    },
    forms = {
        updateSlug : function(slug){
            opt.slug = slug;
        },
        Logout : function(){
            if(opt.model === 'guest') return;
            TippinManager.alert().Modal({
                size : 'sm',
                icon : 'sign-out-alt',
                pre_loader : true,
                centered : true,
                unlock_buttons : false,
                allow_close : false,
                backdrop_ctrl : false,
                title: 'Logging out',
                theme: 'primary'
            });
            if(opt.modules.includes('NotifyManager')) NotifyManager.sockets().disconnect();
            XHR.payload({
                route : '/logout',
                data : {},
                lockout : true,
                success : function () {
                    location.replace('/')
                },
                fail : function () {
                    location.reload()
                }
            })
        },
        ContactUs : function(){
            buttons.addLoader({id : '#sendBTN'});
            let form = new FormData();
            form.append('your_name', $("#your_name").val());
            form.append('your_email', $("#your_email").val());
            form.append('your_message', $("#your_message").val());
            form.append('g-recaptcha-response', $("#g-recaptcha-response").val());
            XHR.payload({
                route : '/Contact/send',
                data : form,
                success : function(data){
                    $("#contact_sec").hide('fast');
                    $("#sent_sec").show('fast');
                    PageListeners.listen().animateLogo({elm : "#RTlog"});
                    $("#sent_response").html(data.msg);
                },
                fail : function(){
                    grecaptcha.reset()
                },
                bypass : true
            });
        }
    };
    return {
        init : methods.Initialize,
        common : function(){
            return {
                model : opt.model,
                id : opt.id,
                name : opt.name,
                slug : opt.slug,
                modules : opt.modules,
                mobile : opt.mobile,
                logs : opt.logs,
                csrf_token: opt.csrf_token
            };
        },
        xhr : function () {
            return XHR
        },
        heartbeat : function(){
            return Heartbeat
        },
        handle : function(){
            return handle
        },
        button : function(){
            return buttons
        },
        alert : function(){
            return alerts
        },
        forms : function(){
            return forms
        },
        format : function(){
            return format
        },
        token : methods.checkCsrfToken
    };
}());
