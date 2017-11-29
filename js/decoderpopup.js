/*!
 * DecoderPopup v 1.0.0 
 * for WebCodeCamJS
 * - if there have more cameras, selector will appears
 * - zoom and selected camera will be saved to cookie
 * Author: Tóth András
 * Web: http://atandrastoth.co.uk
 * email: atandrastoth@gmail.com
 * Licensed under the MIT license
 */
function DecoderPopup(handler) {

    var txt = "innerText" in HTMLElement.prototype ? "innerText" : "textContent";
    var decoder;
    var mousePosition;
    var offset = [0, 0];
    var popup;
    var isDown = false;
    var isError = false;
    String.prototype.toDOM = function() {
        var d = document,
            i, a = d.createElement("div"),
            b = d.createDocumentFragment();
        a.innerHTML = this;
        while (i = a.firstChild) b.appendChild(i);
        return b;
    };

    function removeElement(el) {
        el && el.parentNode && el.parentNode.removeChild(el);
    }

    function setCookie(cname, cvalue) {
        document.cookie = cname + "=" + cvalue;
    }

    function getCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    function open(event, index) {
        if (event != null) {
            event.preventDefault();
            event.stopPropagation();
        }
        var txt = "innerText" in HTMLElement.prototype ? "innerText" : "textContent";
        if (index != null && decoder != null) {
            handler(popup, decoder, index);
            popup.classList.remove("hidden");
            var zoom = parseFloat(getCookie("DECODER_ZOOM"));
            document.querySelector('#bt-zoom').value = decoder.options.zoom = zoom ? zoom : 2;
            decoder.play();
        }
    }

    function init(/**optional*/args) {
        if (decoder == null) {
            var html = [
            '<style type="text/css">',
            '    .hidden {',
            '    opacity: 0;',
            '    visibility: hidden;',
            '}',
            '.decoder-camera {',
            '    transition: opacity .2s, visibility .2s linear;',
            '    background: rgb(255, 255, 255);',
            '    box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.50);',
            '    display: inline-block;',
            '    text-align: center;',
            '    padding: 5px;',
            '    position: fixed;',
            '    top: 20px;',
            '    right: 20px;',
            '    width: min-content;',
            '}',
            '.decoder-camera canvas{',
            '    cursor: move;',
            '}',
            '.decoder-camera *{',
            '    -moz-user-select: none;',
            '   -khtml-user-select: none;',
            '   -webkit-user-select: none;',
            '   -ms-user-select: none;',
            '   user-select: none;',
            '}',
            '.decoder-camera canvas {',
            '    background: #272822;',
            '}',
            '.decoder-camera select {',
            '    margin: 5px;',
            '    padding: 3px;',
            '}',
            '#bt-pause, #bt-play, #bt-stop {',
            '    cursor: pointer;',
            '}',
            '#bt-pause:active, #bt-play:active, #bt-stop:active {',
            '    background: whitesmoke;',
            '}',
            '.slider {',
            '    -webkit-appearance: none;',
            '    height: 10px;',
            '    border-radius: 5px;',
            '    background: #d3d3d3;',
            '    outline: none;',
            '    opacity: 0.7;',
            '    -webkit-transition: .2s;',
            '    transition: opacity .2s;',
            'width: calc(100% - 10px);',
            'margin: 5px;',
            '}',
            '.slider::-webkit-slider-thumb {',
            '    -webkit-appearance: none;',
            '    appearance: none;',
            '    width: 15px;',
            '    height: 15px;',
            '    border-radius: 50%;',
            '    background: blue;',
            '    cursor: pointer;',
            '}',
            '.slider::-moz-range-thumb {',
            '    width: 15px;',
            '    height: 15px;',
            '    border-radius: 50%;',
            '    background: blue;',
            '    cursor: pointer;',
            '}',
            '</style>',
            '<div class="decoder-camera hidden">',
            '   <canvas></canvas>',
            '   <select id="select-menu"></select>',
            '   <input title="zoom" class="slider" id="bt-zoom" max="3" min="1" step="0.2" type="range">',
            '   <div>',
            '       <svg style="width:48px;height:48px" viewbox="0 0 24 24" id="bt-play">',
            '           <path d="M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M10,16.5L16,12L10,7.5V16.5Z" fill="green">',
            '           </path>',
            '       </svg>',
            '       <svg style="width:48px;height:48px" viewbox="0 0 24 24" id="bt-pause">',
            '           <path d="M13,16V8H15V16H13M9,16V8H11V16H9M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z" fill="orange">',
            '           </path>',
            '       </svg>',
            '       <svg style="width:48px;height:48px" viewbox="0 0 24 24" id="bt-stop">',
            '           <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4M9,9V15H15V9" fill="red">',
            '           </path>',
            '       </svg>',
            '   </div>',
            '</div>'
            ].join('');

            document.querySelector("body").appendChild(html.toDOM());
            popup = document.querySelector(".decoder-camera");

            var select = document.querySelector('.decoder-camera select');
            var arg = {
                cameraSuccess: function(stream) {},
                canPlayFunction: function() {},
                getDevicesError: function(error) {
                    if (!isError) {
                        isError = true;
                        alert(error.name);
                    }
                },
                getUserMediaError: function(error) {
                    if (!isError) {
                        isError = true;
                        alert(error.name);
                    }
                },
                cameraError: function(error) {
                    if (!isError) {
                        isError = true;
                        alert(error.name);
                    }
                }
            };

            var index = parseInt(getCookie("DECODER_SELECTED_INDEX"));
            decoder = new WebCodeCamJS("canvas").buildSelectMenu(select, index ? index : 'environment|back').init(typeof args === 'undefined' ? arg : args);

            function selectChanged(event) {
                event.stopPropagation();
                setCookie("DECODER_SELECTED_INDEX", select.selectedIndex.toString());
                decoder.stop();
                decoder.play();
            }

            function play(event) {
                event.stopPropagation();
                decoder.play();
            }

            function stop(event) {
                event.stopPropagation();
                decoder.stop();
                popup.classList.add("hidden");
            }

            function pause(event) {
                event.stopPropagation();
                decoder.pause();
            }

            function change(event) {
                event.stopPropagation();
                setCookie("DECODER_ZOOM", this.value.toString());
                decoder.options.zoom = this.value;
            }

            function mouseDown(event) {
                event.stopPropagation();
                if (event.target.tagName.toLocaleLowerCase() == "canvas") {
                    isDown = true;
                    decoder.pause();
                    offset = [
                        popup.offsetLeft - event.clientX,
                        popup.offsetTop - event.clientY
                    ];
                }
            }

            function mouseUp(event) {
                event.stopPropagation();
                if(isDown) {
                    isDown = false;
                    decoder.play();
                }
            }

            function mouseMove(event) {
                if (isDown) {
                    mousePosition = {
                        x: event.clientX,
                        y: event.clientY
                    };
                    popup.style.left = (mousePosition.x + offset[0]) + 'px';
                    popup.style.top = (mousePosition.y + offset[1]) + 'px';
                }
            }
            popup.addEventListener('mousedown', mouseDown, false);
            document.addEventListener('mouseup', mouseUp, false);
            document.addEventListener('mousemove', mouseMove, false);
            popup.querySelector('#bt-zoom').addEventListener('change', change, false);
            popup.querySelector('#bt-play').addEventListener('click', play, false);
            popup.querySelector('#bt-stop').addEventListener('click', stop, false);
            popup.querySelector('#bt-pause').addEventListener('click', pause, false);
            setTimeout(function() {
                if (select.length < 2) {
                    select.style.display = "none";
                } else {
                    select.addEventListener("change", selectChanged, false);
                }
            }, 1000);
            popup.style.width = getComputedStyle(popup).width;
        }
    }
    //window.addEventListener("DOMContentLoaded", dOMContentLoaded, false);
    return {
        init: function(args) {
            init(args);
            return this;
        },
        open: function(evt, index) {
            open(evt, index);
            return this;
        }
    }
}