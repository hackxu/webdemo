/**
 * jscolor, JavaScript Color Picker
 *
 * @version 1.4.1
 * @license GNU Lesser General Public License, http://www.gnu.org/copyleft/lesser.html
 * @author  Jan Odvarko, http://odvarko.cz
 * @created 2008-06-15
 * @updated 2013-04-08
 * @link    http://jscolor.com
 */


var jscolor = {


    dir: '', // location of jscolor directory (leave empty to autodetect)
    bindClass: 'jscolor', // class name
    binding: true, // automatic binding via <input class="...">
    preloading: true, // use image preloading?

    install: function () {
        jscolor.addEvent(window, 'load', jscolor.init);
    },


    init: function () {
        if (jscolor.binding) {
            jscolor.bind();
        }
        if (jscolor.preloading) {
            jscolor.preload();
        }
    },


    getDir: function () {
        if (!jscolor.dir) {
            var detected = jscolor.detectDir();
            jscolor.dir = detected !== false ? detected : 'jscolor/';
        }
        return jscolor.dir;
    },


    detectDir: function () {
        var base = location.href;

        var e = document.getElementsByTagName('base');
        for (var i = 0; i < e.length; i += 1) {
            if (e[i].href) { base = e[i].href; }
        }

        var e = document.getElementsByTagName('script');
        for (var i = 0; i < e.length; i += 1) {
            if (e[i].src && /(^|\/)jscolor2\.js([?#].*)?$/i.test(e[i].src)) {//��Ҫ�Ļ���
                var src = new jscolor.URI(e[i].src);
                var srcAbs = src.toAbsolute(base);
                srcAbs.path = srcAbs.path.replace(/[^\/]+$/, ''); // remove filename
                srcAbs.query = null;
                srcAbs.fragment = null;
                return srcAbs.toString();
            }
        }
        return false;
    },


    bind: function () {
        var matchClass = new RegExp('(^|\\s)(' + jscolor.bindClass + ')\\s*(\\{[^}]*\\})?', 'i');
        var e = document.getElementsByTagName('input');
        for (var i = 0; i < e.length; i += 1) {
            var m;
            if (!e[i].color && e[i].className && (m = e[i].className.match(matchClass))) {
                var prop = {};
                if (m[3]) {
                    try {
                        prop = (new Function('return (' + m[3] + ')'))();
                    } catch (eInvalidProp) { }
                }
                e[i].color = new jscolor.color(e[i], prop);
            }
        }
    },


    preload: function () {
        for (var fn in jscolor.imgRequire) {
            if (jscolor.imgRequire.hasOwnProperty(fn)) {
                jscolor.loadImage(fn);
            }
        }
    },


    images: {
        pad: [181, 101],
        sld: [16, 101],
        cross: [15, 15],
        arrow: [7, 11]
    },


    imgRequire: {},
    imgLoaded: {},


    requireImage: function (filename) {
        jscolor.imgRequire[filename] = true;
    },


    loadImage: function (filename) {
        if (!jscolor.imgLoaded[filename]) {
            jscolor.imgLoaded[filename] = new Image();
            jscolor.imgLoaded[filename].src = jscolor.getDir() + filename;
        }
    },


    fetchElement: function (mixed) {
        return typeof mixed === 'string' ? document.getElementById(mixed) : mixed;
    },


    addEvent: function (el, evnt, func) {
        if (el.addEventListener) {
            el.addEventListener(evnt, func, false);
        } else if (el.attachEvent) {
            el.attachEvent('on' + evnt, func);
        }
    },


    fireEvent: function (el, evnt) {
        if (!el) {
            return;
        }
        if (document.createEvent) {
            var ev = document.createEvent('HTMLEvents');
            ev.initEvent(evnt, true, true);
            el.dispatchEvent(ev);
        } else if (document.createEventObject) {
            var ev = document.createEventObject();
            el.fireEvent('on' + evnt, ev);
        } else if (el['on' + evnt]) { // alternatively use the traditional event model (IE5)
            el['on' + evnt]();
        }
    },


    getElementPos: function (e, ancesstor) {
        var e1 = e, e2 = e;
        var x = 0, y = 0;
        if (e1.offsetParent) {
            do {
                x += e1.offsetLeft;
                y += e1.offsetTop;
            } while ((e1 = e1.offsetParent) && (e1 != ancesstor));
        }
        while ((e2 = e2.parentNode) && (e2.nodeName.toUpperCase() !== 'BODY') && (e2 != ancesstor)) {
            x -= e2.scrollLeft;
            y -= e2.scrollTop;
        }
        return [x, y];
    },


    getElementSize: function (e) {
        return [e.offsetWidth, e.offsetHeight];
    },


    getRelMousePos: function (e) {
        var x = 0, y = 0;
        if (!e) { e = window.event; }
        if (typeof e.offsetX === 'number') {
            x = e.offsetX;
            y = e.offsetY;
        } else if (typeof e.layerX === 'number') {
            x = e.layerX;
            y = e.layerY;
        }
        return { x: x, y: y };
    },


    getViewPos: function (target) {
        return [target.scrollLeft, target.scrollTop];
    },


    getViewSize: function (target) {
        return [target.clientWidth, target.clientHeight];
    },


    URI: function (uri) { // See RFC3986

        this.scheme = null;
        this.authority = null;
        this.path = '';
        this.query = null;
        this.fragment = null;

        this.parse = function (uri) {
            var m = uri.match(/^(([A-Za-z][0-9A-Za-z+.-]*)(:))?((\/\/)([^\/?#]*))?([^?#]*)((\?)([^#]*))?((#)(.*))?/);
            this.scheme = m[3] ? m[2] : null;
            this.authority = m[5] ? m[6] : null;
            this.path = m[7];
            this.query = m[9] ? m[10] : null;
            this.fragment = m[12] ? m[13] : null;
            return this;
        };

        this.toString = function () {
            var result = '';
            if (this.scheme !== null) { result = result + this.scheme + ':'; }
            if (this.authority !== null) { result = result + '//' + this.authority; }
            if (this.path !== null) { result = result + this.path; }
            if (this.query !== null) { result = result + '?' + this.query; }
            if (this.fragment !== null) { result = result + '#' + this.fragment; }
            return result;
        };

        this.toAbsolute = function (base) {
            var base = new jscolor.URI(base);
            var r = this;
            var t = new jscolor.URI;

            if (base.scheme === null) { return false; }

            if (r.scheme !== null && r.scheme.toLowerCase() === base.scheme.toLowerCase()) {
                r.scheme = null;
            }

            if (r.scheme !== null) {
                t.scheme = r.scheme;
                t.authority = r.authority;
                t.path = removeDotSegments(r.path);
                t.query = r.query;
            } else {
                if (r.authority !== null) {
                    t.authority = r.authority;
                    t.path = removeDotSegments(r.path);
                    t.query = r.query;
                } else {
                    if (r.path === '') {
                        t.path = base.path;
                        if (r.query !== null) {
                            t.query = r.query;
                        } else {
                            t.query = base.query;
                        }
                    } else {
                        if (r.path.substr(0, 1) === '/') {
                            t.path = removeDotSegments(r.path);
                        } else {
                            if (base.authority !== null && base.path === '') {
                                t.path = '/' + r.path;
                            } else {
                                t.path = base.path.replace(/[^\/]+$/, '') + r.path;
                            }
                            t.path = removeDotSegments(t.path);
                        }
                        t.query = r.query;
                    }
                    t.authority = base.authority;
                }
                t.scheme = base.scheme;
            }
            t.fragment = r.fragment;

            return t;
        };

        function removeDotSegments(path) {
            var out = '';
            while (path) {
                if (path.substr(0, 3) === '../' || path.substr(0, 2) === './') {
                    path = path.replace(/^\.+/, '').substr(1);
                } else if (path.substr(0, 3) === '/./' || path === '/.') {
                    path = '/' + path.substr(3);
                } else if (path.substr(0, 4) === '/../' || path === '/..') {
                    path = '/' + path.substr(4);
                    out = out.replace(/\/?[^\/]*$/, '');
                } else if (path === '.' || path === '..') {
                    path = '';
                } else {
                    var rm = path.match(/^\/?[^\/]*/)[0];
                    path = path.substr(rm.length);
                    out = out + rm;
                }
            }
            return out;
        }

        if (uri) {
            this.parse(uri);
        }

    },


    //
    // Usage example:
    // var myColor = new jscolor.color(myInputElement)
    //

    color: function (target, prop) {
        //if (target && target.value) {
        //    this.alph = target.value.match(/\d+\.?\d*/g)[3];
        //}
        this.required = true; // refuse empty values?
        this.adjust = true; // adjust value to uniform notation?
        this.hash = true; // prefix color with # symbol?
        this.caps = true; // uppercase?
        this.slider = true; // show the value/saturation slider?
        this.valueElement = target; // value holder
        this.styleElement = target; // where to reflect current color
        this.onImmediateChange = null; // onchange callback (can be either string or function)
        this.hsv = [0, 0, 1, 1]; // read-only  0-6, 0-1, 0-1
        this.rgb = [1, 1, 1, 1]; // read-only  0-1, 0-1, 0-1
        this.minH = 0; // read-only  0-6
        this.maxH = 6; // read-only  0-6
        this.minS = 0; // read-only  0-1
        this.maxS = 1; // read-only  0-1
        this.minV = 0; // read-only  0-1
        this.maxV = 1; // read-only  0-1
        this.minA = 0; // read-only  0-1
        this.maxA = 1  // read-only  0-1
        // ��ŵ�ɫ�������������selector������Ӧ����target������
        this.boxDiv = document.querySelector(".mbe-propList");

        this.pickerOnfocus = true; // display picker on focus?
        this.pickerMode = 'HSV'; // HSV | HVS
        this.pickerPosition = 'bottom'; // left | right | top | bottom
        this.pickerSmartPosition = true; // automatically adjust picker position when necessary
        this.pickerButtonHeight = 20; // px
        this.pickerClosable = true;
        this.pickerCloseText = 'Close';
        this.pickerButtonColor = 'ButtonText'; // px
        this.pickerFace = 10; // px
        this.pickerFaceColor = 'ThreeDFace'; // CSS color
        this.pickerBorder = 1; // px
        this.pickerBorderColor = 'ThreeDHighlight ThreeDShadow ThreeDShadow ThreeDHighlight'; // CSS color
        this.pickerInset = 1; // px
        this.pickerInsetColor = 'ThreeDShadow ThreeDHighlight ThreeDHighlight ThreeDShadow'; // CSS color
        this.pickerZIndex = 10000;


        for (var p in prop) {
            if (prop.hasOwnProperty(p)) {
                this[p] = prop[p];
            }
        }


        this.hidePicker = function () {
            if (isPickerOwner()) {
                removePicker();
            }
        };


        this.showPicker = function (alph) {
            if (!isPickerOwner()) {
                // ȷ�� THIS.boxDiv ���ж�λ��
                if (!THIS.boxDiv.style.position || THIS.boxDiv.style.position == "static")
                    THIS.boxDiv.style.position = "relative";
                var tp = jscolor.getElementPos(target, THIS.boxDiv); // target pos
                var ts = jscolor.getElementSize(target); // target size
                var vp = jscolor.getViewPos(THIS.boxDiv); // view pos
                var vs = jscolor.getViewSize(THIS.boxDiv); // view size
                var ps = getPickerDims(this); // picker size
                var a, b, c;

                switch (this.pickerPosition.toLowerCase()) {
                    case 'left': a = 1; b = 0; c = -1; break;
                    case 'right': a = 1; b = 0; c = 1; break;
                    case 'top': a = 0; b = 1; c = -1; break;
                    default: a = 0; b = 1; c = 1; break;
                }
                var l = (ts[b] + ps[b]) / 2;

                // picker pos
                if (!this.pickerSmartPosition) {
                    var pp = [
                        tp[a],
                        tp[b] + ts[b] - l + l * c
                    ];
                } else {
                    var pp = [tp[a] + ts[a] - ps[a],//����������Ҹ�������Ϊǿ���Ҷ���
                          -vp[b] + tp[b] + ts[b] + ps[b] - l + l * c > vs[b] ?
                              (-vp[b] + tp[b] + ts[b] / 2 > vs[b] / 2 && tp[b] + ts[b] - l - l * c >= 0 ? tp[b] + ts[b] - l - l * c : tp[b] + ts[b] - l + l * c) :
                              (tp[b] + ts[b] - l + l * c >= 0 ? tp[b] + ts[b] - l + l * c : tp[b] + ts[b] - l - l * c)
                    ];
                }
                drawPicker(pp[a], pp[b], alph);
            }
        };


        this.importColor = function () {
            if (!valueElement) {
                this.exportColor();
            } else {
                if (!this.adjust) {
                    if (!this.fromString(valueElement.value, 1, leaveValue)) {
                        styleElement.style.backgroundImage = styleElement.jscStyle.backgroundImage;
                        styleElement.style.backgroundColor = styleElement.jscStyle.backgroundColor;
                        styleElement.style.color = styleElement.jscStyle.color;
                        this.exportColor(leaveValue | leaveStyle);
                    }
                } else if (!this.required && /^\s*$/.test(valueElement.value)) {
                    valueElement.value = '';
                    styleElement.style.backgroundImage = styleElement.jscStyle.backgroundImage;
                    styleElement.style.backgroundColor = styleElement.jscStyle.backgroundColor;
                    styleElement.style.color = styleElement.jscStyle.color;
                    this.exportColor(leaveValue | leaveStyle);

                } else if (this.fromString(valueElement.value)) {
                    // OK
                } else {
                    this.exportColor();
                }
            }
        };


        this.exportColor = function (flags) {
            if (!(flags & leaveValue) && valueElement) {
                //var value = this.toString();
                var value = 'rgba('
               + Math.round(255 * this.rgb[0]) + ','
               + Math.round(255 * this.rgb[1]) + ','
               + Math.round(255 * this.rgb[2]) + ','
               + this.rgb[3] + '' +
               ')';
                //if (this.caps) { value = value.toUpperCase(); }
                //if (this.hash) { value = '#' + value; }
                valueElement.value = value;
            }
            if (!(flags & leaveStyle) && styleElement) {
                styleElement.style.backgroundImage = "none";
                //styleElement.style.backgroundColor =
                //	'#' + this.toString();
                styleElement.style.color =
                    0.213 * this.rgb[0] +
                    0.715 * this.rgb[1] +
                    0.072 * this.rgb[2]
                    < 0.5 ? '#FFF' : '#000';
                styleElement.style.backgroundColor = 'rgba('
                 + Math.round(255 * this.rgb[0]) + ','
                 + Math.round(255 * this.rgb[1]) + ','
                 + Math.round(255 * this.rgb[2]) + ','
                 + this.rgb[3] + ')';
            }
            if (!(flags & leavePad) && isPickerOwner()) {
                redrawPad();
            }
            if (!(flags & leaveSld) && isPickerOwner()) {
                redrawSld();
            }
        };


        this.fromHSV = function (h, s, v, a, flags) { // null = don't change
            if (h !== null) { h = Math.max(0.0, this.minH, Math.min(6.0, this.maxH, h)); }
            if (s !== null) { s = Math.max(0.0, this.minS, Math.min(1.0, this.maxS, s)); }
            if (v !== null) { v = Math.max(0.0, this.minV, Math.min(1.0, this.maxV, v)); }
            if (a !== null) { a = Math.max(0.0, this.minA, Math.min(1.0, this.maxA, a)); }
            this.rgb = HSV_RGB(
                h === null ? this.hsv[0] : (this.hsv[0] = h),
                s === null ? this.hsv[1] : (this.hsv[1] = s),
                v === null ? this.hsv[2] : (this.hsv[2] = v),
                a === null ? this.hsv[3] : (this.hsv[3] = a)
            );

            this.exportColor(flags);
        };


        this.fromRGB = function (r, g, b, a, flags) { // null = don't change
            if (r !== null) { r = Math.max(0.0, Math.min(1.0, r)); }
            if (g !== null) { g = Math.max(0.0, Math.min(1.0, g)); }
            if (b !== null) { b = Math.max(0.0, Math.min(1.0, b)); }
            if (a !== null) { a = Math.max(0.0, Math.min(1.0, a)); }
            var hsv = RGB_HSV(
                r === null ? this.rgb[0] : r,
                g === null ? this.rgb[1] : g,
                b === null ? this.rgb[2] : b,
                a === null ? this.rgb[3] : a
            );
            if (hsv[0] !== null) {
                this.hsv[0] = Math.max(0.0, this.minH, Math.min(6.0, this.maxH, hsv[0]));
            }
            if (hsv[2] !== 0) {
                this.hsv[1] = hsv[1] === null ? null : Math.max(0.0, this.minS, Math.min(1.0, this.maxS, hsv[1]));
            }
            this.hsv[2] = hsv[2] === null ? null : Math.max(0.0, this.minV, Math.min(1.0, this.maxV, hsv[2]));

            // update RGB according to final HSV, as some values might be trimmed
            var rgb = HSV_RGB(this.hsv[0], this.hsv[1], this.hsv[2], a);
            this.rgb[0] = rgb[0];
            this.rgb[1] = rgb[1];
            this.rgb[2] = rgb[2];
            this.rgb[3] = rgb[3];

            this.exportColor(flags);
        };


        this.fromString = function (hex, a, flags) {
            var m;
            if (hex.match(/rgba\(.*\)/)) {
                var rgba = valueElement.value.match(/\d+\.?\d*/g);
                var r = parseInt(rgba[0]).toString(16).toUpperCase();
                var g = parseInt(rgba[1]).toString(16).toUpperCase();
                var b = parseInt(rgba[2]).toString(16).toUpperCase();
                a = parseFloat(rgba[3]).toString();

                r = r.length < 2 ? "0" + r : r;
                g = g.length < 2 ? "0" + g : g;
                b = b.length < 2 ? "0" + b : b;

                hex = '#' + r + g + b;
            }
            m = hex.match(/^\W*([0-9A-F]{3}([0-9A-F]{3})?)\W*$/i);
            if (!m) {
                return false;
            } else {
                if (m[1].length === 6) { // 6-char notation
                    this.fromRGB(
                        parseInt(m[1].substr(0, 2), 16) / 255,
                        parseInt(m[1].substr(2, 2), 16) / 255,
                        parseInt(m[1].substr(4, 2), 16) / 255,
                        a,
                        flags
                    );
                } else { // 3-char notation
                    this.fromRGB(
                        parseInt(m[1].charAt(0) + m[1].charAt(0), 16) / 255,
                        parseInt(m[1].charAt(1) + m[1].charAt(1), 16) / 255,
                        parseInt(m[1].charAt(2) + m[1].charAt(2), 16) / 255,
                        a,
                        flags
                    );
                }
                return true;
            }
        };


        this.toString = function () {
            return (
                (0x100 | Math.round(255 * this.rgb[0])).toString(16).substr(1) +
                (0x100 | Math.round(255 * this.rgb[1])).toString(16).substr(1) +
                (0x100 | Math.round(255 * this.rgb[2])).toString(16).substr(1)
            );
        };


        function RGB_HSV(r, g, b) {
            var n = Math.min(Math.min(r, g), b);
            var v = Math.max(Math.max(r, g), b);
            var m = v - n;
            if (m === 0) { return [null, 0, v]; }
            var h = r === n ? 3 + (b - g) / m : (g === n ? 5 + (r - b) / m : 1 + (g - r) / m);
            return [h === 6 ? 0 : h, m / v, v];
        }


        function HSV_RGB(h, s, v, a) {
            if (h === null) { return [v, v, v]; }
            var i = Math.floor(h);
            var f = i % 2 ? h - i : 1 - (h - i);
            var m = v * (1 - s);
            var n = v * (1 - s * f);
            switch (i) {
                case 6:
                case 0: return [v, n, m, a];
                case 1: return [n, v, m, a];
                case 2: return [m, v, n, a];
                case 3: return [m, n, v, a];
                case 4: return [n, m, v, a];
                case 5: return [v, m, n, a];
            }
        }


        function removePicker() {


            THIS.boxDiv.removeChild(jscolor.picker.boxB);

            delete jscolor.picker.owner;
        }


        function drawPicker(x, y, alph) {
            if (!jscolor.picker) {
                jscolor.picker = {
                    box: document.createElement('div'),
                    boxB: document.createElement('div'),
                    pad: document.createElement('div'),
                    padB: document.createElement('div'),
                    padM: document.createElement('div'),
                    sld: document.createElement('div'),
                    sldB: document.createElement('div'),
                    sldM: document.createElement('div'),
                    btn: document.createElement('div'),
                    btnS: document.createElement('span'),
                    btnT: document.createTextNode(THIS.pickerCloseText),
                    iptcav: document.createElement('input'),
                    iptcar: document.createElement('input'),
                    iptbox: document.createElement('div')
                };
                for (var i = 0, segSize = 4; i < jscolor.images.sld[1]; i += segSize) {
                    var seg = document.createElement('div');
                    seg.style.height = segSize + 'px';
                    seg.style.fontSize = '1px';
                    seg.style.lineHeight = '0';
                    jscolor.picker.sld.appendChild(seg);
                }
                jscolor.picker.sldB.appendChild(jscolor.picker.sld);
                jscolor.picker.box.appendChild(jscolor.picker.sldB);
                jscolor.picker.box.appendChild(jscolor.picker.sldM);
                jscolor.picker.padB.appendChild(jscolor.picker.pad);
                jscolor.picker.box.appendChild(jscolor.picker.padB);
                jscolor.picker.box.appendChild(jscolor.picker.padM);
                jscolor.picker.btnS.appendChild(jscolor.picker.btnT);
                jscolor.picker.btn.appendChild(jscolor.picker.btnS);
                jscolor.picker.box.appendChild(jscolor.picker.btn);
                jscolor.picker.box.appendChild(jscolor.picker.iptbox);
                jscolor.picker.iptbox.appendChild(jscolor.picker.iptcav);
                jscolor.picker.iptbox.appendChild(jscolor.picker.iptcar);
                jscolor.picker.boxB.appendChild(jscolor.picker.box);

            }

            var p = jscolor.picker;

            // controls interaction
            p.box.onmouseup =
            p.box.onmouseout = function () { target.focus(); };
            p.box.onmousedown = function () { abortBlur = false; };
            p.box.onmousemove = function (e) {
                if (holdPad || holdSld) {
                    holdPad && setPad(e);
                    holdSld && setSld(e);
                    if (document.selection) {
                        document.selection.empty();
                    } else if (window.getSelection) {
                        window.getSelection().removeAllRanges();
                    }
                    dispatchImmediateChange();
                }
            };
            if ('ontouchstart' in window) { // if touch device
                p.box.addEventListener('touchmove', function (e) {
                    var event = {
                        'offsetX': e.touches[0].pageX - touchOffset.X,
                        'offsetY': e.touches[0].pageY - touchOffset.Y
                    };
                    if (holdPad || holdSld) {
                        holdPad && setPad(event);
                        holdSld && setSld(event);
                        dispatchImmediateChange();
                    }
                    e.stopPropagation(); // prevent move "view" on broswer
                    e.preventDefault(); // prevent Default - Android Fix (else android generated only 1-2 touchmove events)
                }, false);
            }
            p.padM.onmouseup =
            p.padM.onmouseout = function () { if (holdPad) { holdPad = false; jscolor.fireEvent(valueElement, 'change'); } };
            p.padM.onmousedown = function (e) {
                // if the slider is at the bottom, move it up
                switch (modeID) {
                    case 0: if (THIS.hsv[2] === 0) { THIS.fromHSV(null, null, 1.0, jscolor.picker.iptcar.value / 100); }; break;
                    case 1: if (THIS.hsv[1] === 0) { THIS.fromHSV(null, 1.0, null, jscolor.picker.iptcar.value / 100); }; break;
                }
                holdSld = false;
                holdPad = true;
                setPad(e);
                dispatchImmediateChange();
            };
            if ('ontouchstart' in window) {
                p.padM.addEventListener('touchstart', function (e) {
                    touchOffset = {
                        'X': e.target.offsetParent.offsetLeft,
                        'Y': e.target.offsetParent.offsetTop
                    };
                    this.onmousedown({
                        'offsetX': e.touches[0].pageX - touchOffset.X,
                        'offsetY': e.touches[0].pageY - touchOffset.Y
                    });
                });
            }
            p.sldM.onmouseup =
            p.sldM.onmouseout = function () { if (holdSld) { holdSld = false; jscolor.fireEvent(valueElement, 'change'); } };
            p.sldM.onmousedown = function (e) {
                holdPad = false;
                holdSld = true;
                setSld(e);
                dispatchImmediateChange();
            };
            if ('ontouchstart' in window) {
                p.sldM.addEventListener('touchstart', function (e) {
                    touchOffset = {
                        'X': e.target.offsetParent.offsetLeft,
                        'Y': e.target.offsetParent.offsetTop
                    };
                    this.onmousedown({
                        'offsetX': e.touches[0].pageX - touchOffset.X,
                        'offsetY': e.touches[0].pageY - touchOffset.Y
                    });
                });
            }

            // picker
            var dims = getPickerDims(THIS);
            p.box.style.width = dims[0] + 'px';
            p.box.style.height = dims[1] + 'px';

            // picker border
            p.boxB.style.position = 'absolute';
            p.boxB.style.clear = 'both';
            p.boxB.style.left = x + 25 + 'px';
            p.boxB.style.top = y + 'px';
            p.boxB.style.zIndex = THIS.pickerZIndex;
            p.boxB.style.border = THIS.pickerBorder + 'px solid';
            p.boxB.style.borderColor = THIS.pickerBorderColor;
            p.boxB.style.background = THIS.pickerFaceColor;

            // pad image
            p.pad.style.width = jscolor.images.pad[0] + 'px';
            p.pad.style.height = jscolor.images.pad[1] + 'px';

            // pad border
            p.padB.style.position = 'absolute';
            p.padB.style.left = THIS.pickerFace + 'px';
            p.padB.style.top = THIS.pickerFace + 'px';
            p.padB.style.border = THIS.pickerInset + 'px solid';
            p.padB.style.borderColor = THIS.pickerInsetColor;

            // pad mouse area
            p.padM.style.position = 'absolute';
            p.padM.style.left = '0';
            p.padM.style.top = '0';
            p.padM.style.width = THIS.pickerFace + 2 * THIS.pickerInset + jscolor.images.pad[0] + jscolor.images.arrow[0] + 'px';
            p.padM.style.height = parseInt(p.box.style.height) - 32 + 'px';
            p.padM.style.cursor = 'crosshair';

            // slider image
            p.sld.style.overflow = 'hidden';
            p.sld.style.width = jscolor.images.sld[0] + 'px';
            p.sld.style.height = jscolor.images.sld[1] + 'px';

            // slider border
            p.sldB.style.display = THIS.slider ? 'block' : 'none';
            p.sldB.style.position = 'absolute';
            p.sldB.style.right = THIS.pickerFace + 'px';
            p.sldB.style.top = THIS.pickerFace + 'px';
            p.sldB.style.border = THIS.pickerInset + 'px solid';
            p.sldB.style.borderColor = THIS.pickerInsetColor;

            // slider mouse area
            p.sldM.style.display = THIS.slider ? 'block' : 'none';
            p.sldM.style.position = 'absolute';
            p.sldM.style.right = '0';
            p.sldM.style.top = '0';
            p.sldM.style.width = jscolor.images.sld[0] + jscolor.images.arrow[0] + THIS.pickerFace + 2 * THIS.pickerInset + 'px';
            p.sldM.style.height = p.box.style.height;
            try {
                p.sldM.style.cursor = 'pointer';
            } catch (eOldIE) {
                p.sldM.style.cursor = 'hand';
            }

            // "close" button
            function setBtnBorder() {
                var insetColors = THIS.pickerInsetColor.split(/\s+/);
                var pickerOutsetColor = insetColors.length < 2 ? insetColors[0] : insetColors[1] + ' ' + insetColors[0] + ' ' + insetColors[0] + ' ' + insetColors[1];
                p.btn.style.borderColor = pickerOutsetColor;
            }
            p.btn.style.display = THIS.pickerClosable ? 'block' : 'none';
            p.btn.style.position = 'absolute';
            p.btn.style.left = THIS.pickerFace + 'px';
            p.btn.style.bottom = THIS.pickerFace + 'px';
            p.btn.style.padding = '0 15px';
            p.btn.style.height = '18px';
            p.btn.style.border = THIS.pickerInset + 'px solid';
            setBtnBorder();
            p.btn.style.color = THIS.pickerButtonColor;
            p.btn.style.font = '12px sans-serif';
            p.btn.style.textAlign = 'center';
            try {
                p.btn.style.cursor = 'pointer';
            } catch (eOldIE) {
                p.btn.style.cursor = 'hand';
            }
            p.btn.onmousedown = function () {
                THIS.hidePicker();
            };
            p.btnS.style.lineHeight = p.btn.style.height;

            // load images in optimal order
            switch (modeID) {
                case 0: var padImg = 'hs.png'; break;
                case 1: var padImg = 'hv.png'; break;
            }
            p.padM.style.backgroundImage = "url('" + jscolor.getDir() + "cross.gif')";
            p.padM.style.backgroundRepeat = "no-repeat";
            p.sldM.style.backgroundImage = "url('" + jscolor.getDir() + "arrow.gif')";
            p.sldM.style.backgroundRepeat = "no-repeat";
            p.pad.style.backgroundImage = "url('" + jscolor.getDir() + padImg + "')";
            p.pad.style.backgroundRepeat = "no-repeat";
            p.pad.style.backgroundPosition = "0 0";

            p.iptbox.style.width = p.padM.style.width - 80;
            p.iptbox.style.height = 30 + 'px';
            p.iptbox.style.padding = '5px 0 5px 5px';
            p.iptbox.style.position = 'absolute';
            p.iptbox.style.right = 10 + 'px';
            p.iptbox.style.bottom = 10 + 'px';

            p.iptcar.type = 'range';
            p.iptcar.defaultValue = 100;
            p.iptcar.value = alph * 100;
            p.iptcar.min = 0;
            p.iptcar.max = 100;
            p.iptcar.step = 10;
            p.iptcar.style.width = 100 + "px";
            p.iptcar.style.cssFloat = 'left';
            p.iptcar.onmouseup =
            //p.iptcar.onmouseout = function () { if (holdIpr) { holdIpr = false; jscolor.fireEvent(this, 'change'); } };
            p.iptcar.onmousedown = function (e) {
                // if the slider is at the bottom, move it up
                p.iptcav.value = this.value;
            };
            p.iptcar.onchange = function (e) {
                switch (modeID) {
                    case 0: if (THIS.hsv[2] === 0) { THIS.fromHSV(null, null, 1.0, jscolor.picker.iptcar.value / 100); }; break;
                    case 1: if (THIS.hsv[1] === 0) { THIS.fromHSV(null, 1.0, null, jscolor.picker.iptcar.value / 100); }; break;
                }
                var pox = parseInt(jscolor.picker.padM.style.backgroundPositionX) - 4;
                var poy = parseInt(jscolor.picker.padM.style.backgroundPositionY) - 4;
                var mpos = { x: pox, y: poy };
                p.iptcav.value = this.value;
                setPad(e, mpos);
                //redrawPad();
                dispatchImmediateChange();
            };


            p.iptcav.type = 'text';
            p.iptcav.defaultValue = 100;
            p.iptcav.value = p.iptcar.value;
            p.iptcav.maxLength = 3;
            p.iptcav.size = 3;
            p.iptcav.readOnly = 'readOnly';
            p.iptcav.style.width = 30 + 'px';
            p.iptcav.style.marginLeft = 5 + 'px';
            p.iptcav.style.marginRight = 5 + 'px';
            p.iptcav.style.cssFloat = 'left';
            p.iptcav.style.fontSize = '12px';
            p.iptcav.onfocus =
            p.iptcav.onblur =

            // place pointers
            redrawPad();
            redrawSld();

            jscolor.picker.owner = THIS;
            THIS.boxDiv.appendChild(p.boxB);
        }


        function getPickerDims(o) {
            var dims = [
                2 * o.pickerInset + 2 * o.pickerFace + jscolor.images.pad[0] +
                    (o.slider ? 2 * o.pickerInset + 2 * jscolor.images.arrow[0] + jscolor.images.sld[0] : 0),
                o.pickerClosable ?
                    4 * o.pickerInset + 3 * o.pickerFace + jscolor.images.pad[1] + o.pickerButtonHeight :
                    2 * o.pickerInset + 2 * o.pickerFace + jscolor.images.pad[1] + 30
            ];
            return dims;
        }


        function redrawPad() {
            // redraw the pad pointer
            switch (modeID) {
                case 0: var yComponent = 1; break;
                case 1: var yComponent = 2; break;
            }
            var x = Math.round((THIS.hsv[0] / 6) * (jscolor.images.pad[0] - 1));
            var y = Math.round((1 - THIS.hsv[yComponent]) * (jscolor.images.pad[1] - 1));
            jscolor.picker.padM.style.backgroundPosition =
                (THIS.pickerFace + THIS.pickerInset + x - Math.floor(jscolor.images.cross[0] / 2)) + 'px ' +
                (THIS.pickerFace + THIS.pickerInset + y - Math.floor(jscolor.images.cross[1] / 2)) + 'px';

            // redraw the slider image
            var seg = jscolor.picker.sld.childNodes;

            switch (modeID) {
                case 0:
                    var rgb = HSV_RGB(THIS.hsv[0], THIS.hsv[1], 1, jscolor.picker.iptcav.value / 100);
                    for (var i = 0; i < seg.length; i += 1) {
                        seg[i].style.backgroundColor = 'rgba(' +
                            (rgb[0] * (1 - i / seg.length) * 100) + '%,' +
                            (rgb[1] * (1 - i / seg.length) * 100) + '%,' +
                            (rgb[2] * (1 - i / seg.length) * 100) + '%,' +
                             rgb[3] + ')'
                        ;
                    }
                    break;
                case 1:
                    var rgb, s, c = [THIS.hsv[2], 0, 0];
                    var i = Math.floor(THIS.hsv[0]);
                    var f = i % 2 ? THIS.hsv[0] - i : 1 - (THIS.hsv[0] - i);
                    switch (i) {
                        case 6:
                        case 0: rgb = [0, 1, 2]; break;
                        case 1: rgb = [1, 0, 2]; break;
                        case 2: rgb = [2, 0, 1]; break;
                        case 3: rgb = [2, 1, 0]; break;
                        case 4: rgb = [1, 2, 0]; break;
                        case 5: rgb = [0, 2, 1]; break;
                    }
                    for (var i = 0; i < seg.length; i += 1) {
                        s = 1 - 1 / (seg.length - 1) * i;
                        c[1] = c[0] * (1 - s * f);
                        c[2] = c[0] * (1 - s);
                        seg[i].style.backgroundColor = 'rgba(' +
                            (c[rgb[0]] * 100) + '%,' +
                            (c[rgb[1]] * 100) + '%,' +
                            (c[rgb[2]] * 100) + '%,' +
                             jscolor.picker.iptcav.value / 100 + ')'
                        ;
                    }
                    break;
            }
        }


        function redrawSld() {
            // redraw the slider pointer
            switch (modeID) {
                case 0: var yComponent = 2; break;
                case 1: var yComponent = 1; break;
            }
            var y = Math.round((1 - THIS.hsv[yComponent]) * (jscolor.images.sld[1] - 1));
            jscolor.picker.sldM.style.backgroundPosition =
                '0 ' + (THIS.pickerFace + THIS.pickerInset + y - Math.floor(jscolor.images.arrow[1] / 2)) + 'px';
        }


        function isPickerOwner() {
            return jscolor.picker && jscolor.picker.owner === THIS;
        }


        function blurTarget() {
            if (valueElement === target) {
                THIS.importColor();
            }
            if (THIS.pickerOnfocus) {
                THIS.hidePicker();
            }
        }


        function blurValue() {
            if (valueElement !== target) {
                THIS.importColor();
            }
        }


        function setPad(e) {
            var mpos = {};
            if (arguments.length > 1) {
                mpos.x = arguments[1].x
                mpos.y = arguments[1].y;
            }
            else {
                mpos = jscolor.getRelMousePos(e);
            }
            var x = mpos.x - THIS.pickerFace - THIS.pickerInset;
            var y = mpos.y - THIS.pickerFace - THIS.pickerInset;
            if (arguments.length > 1) {
                x = mpos.x
                y = mpos.y;
            }
            var a = jscolor.picker.iptcar.value / 100;
            jscolor.picker.iptcav.value = jscolor.picker.iptcar.value;
            switch (modeID) {
                case 0: THIS.fromHSV(x * (6 / (jscolor.images.pad[0] - 1)), 1 - y / (jscolor.images.pad[1] - 1), null, a, leaveSld); break;
                case 1: THIS.fromHSV(x * (6 / (jscolor.images.pad[0] - 1)), null, 1 - y / (jscolor.images.pad[1] - 1), a, leaveSld); break;
            }
        }


        function setSld(e) {
            var mpos = jscolor.getRelMousePos(e);
            var y = mpos.y - THIS.pickerFace - THIS.pickerInset;
            var a = jscolor.picker.iptcar.value / 100;
            jscolor.picker.iptcav.value = jscolor.picker.iptcar.value;
            switch (modeID) {
                case 0: THIS.fromHSV(null, null, 1 - y / (jscolor.images.sld[1] - 1), a, leavePad); break;
                case 1: THIS.fromHSV(null, 1 - y / (jscolor.images.sld[1] - 1), null, a, leavePad); break;
            }
        }


        function dispatchImmediateChange() {
            if (THIS.onImmediateChange) {
                var callback;
                if (typeof THIS.onImmediateChange === 'string') {
                    callback = new Function(THIS.onImmediateChange);
                } else {
                    callback = THIS.onImmediateChange;
                }
                callback.call(THIS);
            }
        }


        var THIS = this;
        var modeID = this.pickerMode.toLowerCase() === 'hvs' ? 1 : 0;
        var abortBlur = false;
        var
            valueElement = jscolor.fetchElement(this.valueElement),
            styleElement = jscolor.fetchElement(this.styleElement);
        var
            holdPad = false,
            holdSld = false,
            holdIpr = false,
            touchOffset = {};
        var
            leaveValue = 1 << 0,
            leaveStyle = 1 << 1,
            leavePad = 1 << 2,
            leaveSld = 1 << 3;

        // target
        jscolor.addEvent(target, 'focus', function () {
            if (target.value.match(/rgba\(.*\)/)) {
                var alph = target.value.match(/\d+\.?\d*/g)[3];
                if (THIS.pickerOnfocus) {
                    THIS.showPicker(alph);
                }
            }
            else {
                if (THIS.pickerOnfocus) {
                    THIS.showPicker();
                }
            }
        });
        //jscolor.addEvent(target, 'blur', function () {
        //    if (!abortBlur) {
        //        window.setTimeout(function () {
        //            abortBlur || blurTarget();
        //            abortBlur = false;
        //        }, 0);
        //    } else {
        //        abortBlur = false;
        //    }
        //});

        // valueElement
        if (valueElement) {
            var updateField = function () {
                //THIS.fromString(valueElement.value, leaveValue);
                if (valueElement.value.match(/rgba\(.*\)/)) {
                    var rgba = valueElement.value.match(/\d+\.?\d*/g);
                    var r = parseInt(rgba[0]).toString(16).toUpperCase();
                    var g = parseInt(rgba[1]).toString(16).toUpperCase();
                    var b = parseInt(rgba[2]).toString(16).toUpperCase();
                    var a = parseFloat(rgba[3]).toString();

                    r = r.length < 2 ? "0" + r : r;
                    g = g.length < 2 ? "0" + g : g;
                    b = b.length < 2 ? "0" + b : b;

                    var hex = '#' + r + g + b;
                    THIS.fromString(hex, a, leaveValue);
                }
                else {
                    THIS.fromString(valueElement.value, '', leaveValue);
                }
                dispatchImmediateChange();
            };
            jscolor.addEvent(valueElement, 'keyup', updateField);
            jscolor.addEvent(valueElement, 'input', updateField);
            jscolor.addEvent(valueElement, 'blur', blurValue);
            valueElement.setAttribute('autocomplete', 'off');
        }

        // styleElement
        if (styleElement) {
            styleElement.jscStyle = {
                backgroundImage: styleElement.style.backgroundImage,
                backgroundColor: valueElement.value,
                color: styleElement.style.color
            };
        }

        // require images
        switch (modeID) {
            case 0: jscolor.requireImage('hs.png'); break;
            case 1: jscolor.requireImage('hv.png'); break;
        }
        jscolor.requireImage('cross.gif');
        jscolor.requireImage('arrow.gif');

        this.importColor();
    }

};