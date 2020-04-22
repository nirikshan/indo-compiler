var ClickId = 0,
    bt = function (name) { //binding Test
        return (/\{(.*)\}/.test(name));
    },
    cs = function (text) {
        var regText = /\{(.+?)\}/g;
        var pieces = text.split(regText);
        var matches = text.match(regText);
        var tokens = [];
        pieces.forEach(function (piece) {
            if (matches && matches.indexOf('{' + piece + '}') > -1) {
                tokens.push(quot('{' + piece + '}'));
            } else if (piece) {
                tokens.push(quot(piece));
            }
        });
        return tokens.filter(item => item.trim() !== '');
    },
    Neww = function (val) {
        return {
            type: "text",
            value: val
        }
    },
    isComponent = function (type) {
        var Name = '"' + type + '"';
        if (type && type.length > 0 && type[0] == type[0].toUpperCase()) {
            ClickId += 1;
            return [
                'cX.childRender(cX , ' + type + ' , _  , REPLACE_CALLER_PROPS)',
                {
                    'c-id': 'cl-' + type.toLowerCase() + '-' + ClickId
                },
                true
            ]
        }
        return [Name, {}, false /*This is not component caller*/ ];
    },
    quot = function (k) {
        if (!bt(k)) {
            if (k.indexOf('"') == -1) {
                k = k.trim().length > 0 ? '"' + k + '"' : k;
            }
        }
        return (k);
    },
    applier = function (value) {
        var alldata = lexical_analysis(value);
        alldata.forEach((el, ind) => {
            if (el.type == 'text' && el.value.trim().length > 0) {
                var splits = cs(alldata[ind].value);
                alldata.splice(ind, 1);
                splits.forEach((sp, indx) => {
                    var replacer = Neww(sp);
                    alldata.splice((ind + indx), 0, replacer);
                });
            } else if (el.type == 'text' && el.value.trim().length <= 0) {
                alldata.splice(ind, 1)
            }
        });
        return (parser(alldata));
    },
    Generate = function Mygenerator(value) {
        var CallerFunctionPropsDefination = [],
            LoopCallerFunctionDefination = {},
            AST = applier(value),
            state = {
                loop: false
            },
            RenderFunction = GenerateNode(CallerFunctionPropsDefination, LoopCallerFunctionDefination, AST.children[0], state);

        if (RenderFunction.length > 0) {
            CallerFunctionPropsDefination = CallerFunctionPropsDefination.join('')
        };

        return ('function(_ , cX ){ ' + (
            CallerFunctionPropsDefination
        ) + ' return(' + RenderFunction[0] + ')}');
    },
    GenerateSyntax = function GenerateSyntax(type, props, DispachChild, Keys, state) {
        var Name = isComponent(type);
        return 'cX.render(' + Name[0] + ',' + ParsePropsUpdatable(Object.assign(props, Name[1]), Keys, state) + ' ,' + DispachChild + ')';
    },
    parseTextExp = function (text, state) {
        var regText = /\{(.+?)\}/g;
        var pieces = text.split(regText);
        var matches = text.match(regText);
        var tokens = [];
        pieces.forEach(function (piece) {
            if (matches && matches.indexOf('{' + piece + '}') > -1) {
                var ele = piece;
                if (!CheckScope(state, piece)) {
                    piece = '_.' + piece;
                }
                tokens.push(piece);
            } else if (piece) {
                tokens.push('"' + piece + '"');
            }
        });
        return tokens.join('+');
    },
    CrunBase = function (Arr) {
        return JSON.stringify(Arr).replace('"' + Arr[0] + '"', Arr[0]);
    },
    ParsePropsUpdatable = function ParsePropsUpdatable(props, keys, state) {
        var mainString = JSON.stringify(props);
        for (var j = 0; j < keys.length; j++) {
            var el = keys[j],
                le = props[el];

            if (el.indexOf(':') !== -1) {
                var parse = parseTextExp('{' + le + '}', state);
                mainString = mainString.replace('"' + le + '"', parse);
                mainString = mainString.replace('"' + el + '"', '"' + el.substr(1, el.length) + '"');
            }
            if (bt(le)) {
                var parse = parseTextExp(le, state);
                mainString = mainString.replace('"' + le + '"', parse)
            }
            if (el == 'c-run') {
                var AttrVal = le,
                    main = AttrVal.indexOf('.') !== -1 ? AttrVal.split('.') : AttrVal;
                if (Array.isArray(main)) {
                    if (!CheckScope(state, AttrVal)) {
                        main[0] = '_.' + main[0];
                        AttrVal = main;
                    } else {
                        AttrVal = main;
                    }
                } //#failing point // very sensative area while using c-run
                mainString = mainString.replace('"c-run":"' + le + '"', '"c-run":' + CrunBase(AttrVal))
            }
        }
        return (mainString)
    },
    CheckScope = function CheckScope(state, ele) { // this is not good way of scope tracking inside loop
        if ('loop' in state && state.loop) {
            var splits = ele !== void 0 ? ele.split('.') : [],
                testBit = splits[0] || false;
            if (testBit && 'exp' in state) {
                var exp = state.exp,
                    parChar = exp[exp.length - 1];
                console.log(exp, parChar)
                if (parChar == testBit) {
                    return (true);
                } else {
                    if ('child' in state && state.child.length > 0) {
                        var child = state.child;
                        for (let index = 0; index < child.length; index++) {
                            var feedBack = (CheckScope(child[index], ele));
                            if (feedBack !== void 0) {
                                return (feedBack);
                            }
                        }
                    } else {
                        return (false);
                    }
                }
            }
        } else {
            return false;
        }
        return false;
    },
    GenerateNode = function GenerateNode(CallerFunctionPropsDefination, LoopCallerFunctionDefination, tree, state) {
        var ElementName = tree.type;
        ElementName = isComponent(ElementName),
            HasCallerComponent = false;
        ComponentInsideLoop = false;

        var RenderFunction = 'cX.render(' + ElementName[0] + ',',
            Props = tree.props !== undefined ? Object.assign(tree.props, ElementName[1]) : {},
            Keys = Object.keys(Props),
            PropsRoot = Props !== undefined ? ParsePropsUpdatable(Props, Keys, state) : null;
        /* 
        * var RenderFunction = RenderFunction + PropsRoot; 
        * 
        *  Rather then adding whole set of props on render function I want to add only prop that contain click-id because there are other data props that 
        *  will be rendered with HTML nodes as attribute at the head of sub component during component render at click.cl
        *     
        *  Hey Nirikshan If there will be problem in future with component head props or props as data then just remove above comment.
        * 
        */ 
         var RenderFunction = RenderFunction + (
            "c-id" in Props ? '{"c-id":"'+Props['c-id']+'"}' : PropsRoot 
         );
        

        /*Component inside loop creating own props scope by assigning them to own sharing variable*/
        if (state.loop && ElementName[2] && 'c-id' in ElementName[1]) {
            HasCallerComponent = true;
            var PropsVariableName = 'Props_' + ElementName[1]['c-id'].replace(/cl-/g, "").replace(/-/g, "_");
            RenderFunction = RenderFunction.replace(PropsRoot, PropsVariableName).replace(new RegExp('REPLACE_CALLER_PROPS', 'g'), PropsVariableName);
            LoopCallerFunctionDefination[state.AttrName] && LoopCallerFunctionDefination[state.AttrName].push('const ' + PropsVariableName + '=' + PropsRoot + ';');
            // ComponentInsideLoop = true;
        }


        if (Keys.indexOf('c-loop') !== -1) {
            var AttrName = Props['c-loop'],
                AttrVal = AttrName.split('>>'),
                LoopPrefix = AttrVal[0],
                LastIndex = AttrVal.length - 1,
                scopeVar = AttrVal[LastIndex],
                LoopHead = AttrVal[1];


            if (scopeVar.indexOf(')') !== -1 && scopeVar.indexOf('(') !== -1) {
                var Splice = scopeVar.match(/\((.*?)\)/)[1];
                if (Splice.indexOf(',') !== -1) {
                    AttrVal.splice(LastIndex, 1);
                    var chunk = Splice.split(','),
                        AttrVal = AttrVal.concat(chunk);
                } else {
                    AttrVal.splice(LastIndex, 1);
                    var AttrVal = AttrVal.concat(Splice)
                }
            } else if (scopeVar.indexOf(',') !== -1) {
                AttrVal.splice(LastIndex, 1);
                var chunk = scopeVar.split(','),
                    AttrVal = AttrVal.concat(chunk);
            }

            if (!CheckScope(state, LoopPrefix)) {
                var LoopPrefix = '_.' + LoopPrefix;
            }

            var NewState = {
                loop: true,
                exp: AttrVal,
                child: [],
                AttrName
            };
            NewState.child.push(state);

            LoopCallerFunctionDefination[AttrName] = [];
            LoopHead = scopeVar.indexOf(')') !== -1 && scopeVar.indexOf('(') !== -1 ? LoopHead.match(/\((.*?)\)/)[1] : LoopHead;
            var LoopedSyntax = GenerateNode(CallerFunctionPropsDefination, LoopCallerFunctionDefination, tree.children[0], NewState);

            var Loopchild = LoopPrefix + `.map(function(${LoopHead}){ 
                      ` + (function () {
                if (
                    AttrName in LoopCallerFunctionDefination &&
                    LoopCallerFunctionDefination[AttrName] !== undefined &&
                    LoopCallerFunctionDefination[AttrName].length > 0
                ) {
                    return LoopCallerFunctionDefination[AttrName].join('');
                }
                return '';
            }()) + `
                      return( ${LoopedSyntax[0]} )
                 })`;


            delete Props['c-loop'];
            return ([
                GenerateSyntax(tree.type, tree.props, Loopchild, Keys, state),
                CallerFunctionPropsDefination,
                HasCallerComponent
            ])
        }

        if (Keys.indexOf('c-if') !== -1) {
            var AttrVal = Props['c-if'];
            if (!CheckScope(state, AttrVal)) {
                var AttrVal = '_.' + AttrVal;
            }
            var NewState = {
                loop: true,
                exp: Array.isArray(AttrVal) ? AttrVal : [],
                child: []
            };
            NewState.child.push(state)
            delete Props['c-if'];
            var RenderFunction = GenerateNode(CallerFunctionPropsDefination, LoopCallerFunctionDefination, tree, NewState),
                condition = '(' + AttrVal + ` ? ` + RenderFunction[0] + ' : false ' + ')',
                ConditionalSyntax = GenerateSyntax(tree.type, tree.props, condition, Keys, state);
            // console.log(condition , '---------------------------------------------------------   ', ConditionalSyntax)
            return ([
                condition,
                CallerFunctionPropsDefination,
                HasCallerComponent
            ])
        }

        var children = tree.children;
        RenderFunction = RenderFunction + ',';
        if (children !== undefined) {
            if (typeof (tree) == 'object') {
                var len = children.length;
                for (var i = 0; i < len; i++) {
                    var ele = children[i],
                        quot = ((len - 1) !== i) ? ',' : '';
                    if (typeof (ele) == 'object') {
                        var data = GenerateNode(CallerFunctionPropsDefination, LoopCallerFunctionDefination, ele, state);
                        RenderFunction = RenderFunction + data[0] + quot;
                    } else {
                        if (bt(ele)) {
                            var ele = ele.replace(/}|{/g, '');
                            if (state.loop) {
                                if (!CheckScope(state, ele)) {
                                    var ele = '_.' + ele;
                                }
                            } else {
                                var ele = '_.' + ele;
                            }
                        }

                        RenderFunction = RenderFunction + ele + quot;
                    }
                }
            }
        } else {
            RenderFunction = RenderFunction + tree + ',';
        }

        //  console.log(state)
        if ('loop' in state && !state.loop && ElementName.length > 0 && ElementName[2]) {
            HasCallerComponent = true;
            var PropsVariableName = 'Props_' + ElementName[1]['c-id'].replace(/cl-/g, "").replace(/-/g, "_");
            RenderFunction = RenderFunction.replace(PropsRoot, PropsVariableName).replace(new RegExp('REPLACE_CALLER_PROPS', 'g'), PropsVariableName);
            CallerFunctionPropsDefination.push('const ' + PropsVariableName + '=' + PropsRoot + ';');
        }

        RenderFunction = RenderFunction + ')';

        return ([
            RenderFunction,
            CallerFunctionPropsDefination,
            HasCallerComponent,
            LoopCallerFunctionDefination
        ]);
    };
