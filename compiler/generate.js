var bt = function(name) {
    return (/\{(.*)\}/.test(name));
 },
 cs = function(a) {
     var d = [],
         le = a.length,
         pos = le,
         init = 0;
     for (var i = init; i < pos; i++) {
         var start = a.indexOf('{'),
             end = a.indexOf('}');
         if (start !== -1) {
             var k = a.substr(init, start);
                 d.push(quot(k))

                 var k1 = a.substr(start, (end + 1) - start + 1);
                 d.push(quot(k1));
         } else {
             var k = a.substr(0, le);
             d.push(quot(k));
             break
         }
         var a = a.substr(end + 2, le)
     }
     var d = d.filter(item => item.trim() !== '');
     return (d)
 },
 Neww= function(val) {
   return { type:"text",value:val}  
 },
 quot = function(k) {
     if(!bt(k)){
         if(k.indexOf('"') == -1){
            k = k.trim().length > 0 ? '"'+k+'"' : k;   
         }
     }
     return(k);
 },
 applier = function(value) {
     var alldata = lexical_analysis(value);
     alldata.forEach((el , ind )=> {
         if(el.type == 'text' && el.value.trim().length > 0){
             var splits = cs(alldata[ind].value);
             alldata.splice(ind, 1);
             splits.forEach((sp , indx) => {
                 var replacer = Neww(sp);
                 alldata.splice((ind + indx), 0, replacer);
             });
         }else if(el.type == 'text' && el.value.trim().length <= 0){
           alldata.splice(ind , 1)
         }  
     });  
     return(parser(alldata));
 },
 Generate = function Mygenerator(value) {
     var AST            =  applier(value),
         RenderFunction =  GenerateNode(AST.children[0] , {loop:false});
     return('function(_ , cX ){return('+RenderFunction+')}');
 },
 GenerateSyntax = function GenerateSyntax(type , props , DispachChild , Keys , state) {
     return 'cX("'+type+'",'+ParsePropsUpdatable(props , Keys , state)+','+DispachChild+')';   
 },
 parseTextExp = function(text , state) {
    var regText = /\{(.+?)\}/g;
    var pieces = text.split(regText);
    var matches = text.match(regText);
    var tokens = [];
    pieces.forEach(function (piece) {
        if (matches && matches.indexOf('{' + piece + '}') > -1) {
            if(!CheckScope(state , piece)){
                var piece = '_.'+piece;
            }
            tokens.push(piece);
        } else if (piece) {
            tokens.push('"' + piece + '"');
        }
    });
    return tokens.join('+');
 },
 ParsePropsUpdatable = function ParsePropsUpdatable(props , keys , state) {
   var mainString = JSON.stringify(props);
   for (var j = 0; j < keys.length; j++) {
         var el = keys[j],
             le = props[el];
            if(bt(le)){
                var parse = parseTextExp(le , state);
                mainString = mainString.replace('"'+le+'"' , parse)
            }
   }
   return(mainString)
 },
 CheckScope = function CheckScope(state , ele){
    var exps = state.exp;
    if(exps !== undefined && exps.length > 0 && exps[1] && exps[1]+'.' === ele.substr(0,(exps[1]+'.').length)){
         return true;
    }else if(exps !== undefined && exps.indexOf(ele.trim()) !== -1){
        return true;
    }else{
        if(state.child){
            var NewState = state.child;
            if(NewState[0].loop){
                return(CheckScope(NewState[0] , ele));
            }
        }
    }
    return(false);
 },
 GenerateNode = function GenerateNode(tree , state) {
         var RenderFunction  = 'cX("'+tree.type+'",',
             Props           = tree.props !== undefined?tree.props:{},
             Keys            = Object.keys(Props),
             PropsRoot       = Props !== undefined ? ParsePropsUpdatable(Props , Keys , state) : null;
             var RenderFunction  = RenderFunction + PropsRoot;
         
         if(Keys.indexOf('c-loop') !== -1){
                 var AttrVal    = Props['c-loop'].split('>>'),
                     LoopPrefix = AttrVal[0],
                     LastIndex  = AttrVal.length - 1,
                     scopeVar   = AttrVal[LastIndex],
                     LoopHead   = AttrVal[1]; 


                    if(scopeVar.indexOf(')') !== -1 && scopeVar.indexOf('(') !== -1){
                        var Splice = scopeVar.match(/\((.*?)\)/)[1]; 
                        if(Splice.indexOf(',') !== -1){
                            AttrVal.splice(LastIndex, 1);
                            var chunk   = Splice.split(','),
                                AttrVal = AttrVal.concat(chunk);
                        }else{
                            AttrVal.splice(LastIndex, 1);
                            var AttrVal = AttrVal.concat(Splice)
                        }
                    }else if(scopeVar.indexOf(',') !== -1){
                        AttrVal.splice(LastIndex, 1);
                        var chunk   = scopeVar.split(','),
                            AttrVal = AttrVal.concat(chunk);
                    }

                 if(!CheckScope(state , LoopPrefix)){
                    var LoopPrefix = '_.'+LoopPrefix;
                 }

                 var NewState = {loop:true , exp:AttrVal , child:[]};
                 NewState.child.push(state);
                 LoopHead = scopeVar.indexOf(')') !== -1 && scopeVar.indexOf('(') !== -1 ? LoopHead.match(/\((.*?)\)/)[1] : LoopHead;
                 var Loopchild = LoopPrefix+`.map(function(${LoopHead}){ return ${GenerateNode(tree.children[0] , NewState)}})`;
                 delete Props['c-loop'];
                 return(GenerateSyntax(tree.type , tree.props , Loopchild , Keys , state))
         }

        if(Keys.indexOf('c-if') !== -1){
                var AttrVal = Props['c-if'];
                if(!CheckScope(state , AttrVal)){
                var AttrVal = '_.'+AttrVal;
                }
                var NewState = {loop:true , exp: Array.isArray(AttrVal) ? AttrVal:[]  , child:[]};
                NewState.child.push(state)
                delete Props['c-if'];
                var condition = AttrVal+`?`+GenerateNode(tree, NewState)+':false';
                return(GenerateSyntax(tree.type , tree.props , condition , Keys , state))
        }

     var children = tree.children;
         RenderFunction = RenderFunction +',';
         if(children !== undefined){
             if(typeof(tree) == 'object'){
                 var len  = children.length;
                 for (var i = 0; i < len; i++) {
                     var ele   =  children[i],
                         quot  = ((len-1) !== i) ? ',' :'';
                     if(typeof(ele) == 'object'){
                         var data  =  GenerateNode(ele , state);
                         RenderFunction = RenderFunction + data+quot;
                     }else{
                         if(bt(ele)){
                           var ele = ele.replace(/}|{/g, '');
                           if(state.loop){
                                if(!CheckScope(state , ele)){
                                    var ele = '_.'+ele;
                                }
                           }else{
                               var ele = '_.'+ele;
                           }
                         }
                         
                         RenderFunction = RenderFunction + ele+quot;
                     }
                 }
             }
         }else{
             RenderFunction = RenderFunction + tree+',';
         }
         
       
         RenderFunction = RenderFunction + ')';
         return(RenderFunction);
    };
