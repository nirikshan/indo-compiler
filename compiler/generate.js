var bt = function(name) {
    return (/\{(.*)\}/.test(name))
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
                 alldata.splice((ind + indx), 0, replacer );
             });
         }else if(el.type == 'text' && el.value.trim().length <= 0){
           alldata.splice(ind , 1)
         }  
     });  
     return(parser(alldata));
 },
 Generate = function Mygenerator(a) {
     var AST = applier(value);
     return GenerateNode(AST.children[0] , {loop:false});
 },
 GenerateSyntax = function GenerateSyntax(type , props , DispachChild) {
     return 'c("'+type+'",'+JSON.stringify(props)+','+DispachChild+')';   
 },
 GenerateNode = function GenerateNode(tree , state) {
         var RenderFunction  = 'c("'+tree.type+'",',
             Props           = tree.props,
             Keys            = Object.keys(Props),
             PropsRoot       = Props !== undefined ? JSON.stringify(Props) : null,
             RenderFunction  = RenderFunction + PropsRoot;
         
         if(Keys.indexOf('c-loop') !== -1){
                 var AttrVal = Props['c-loop'].split('>>');
                 var Loopchild = 'return '+AttrVal[0]+`.map(`+AttrVal[1]+`=>{${GenerateNode(tree.children[0] , {loop:true , exp:AttrVal})}})`;
                 delete Props['c-loop'];
                 return(GenerateSyntax(tree.type , tree.props , Loopchild))
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
                                var exps = state.exp;
                               // console.log(ele ,exps[exps.length - 1]+'.' , ele.indexOf(exps[exps.length - 1]+'.') )
                                if(ele.indexOf(exps[0]+'.') !== -1){
                                  //  console.log(ele ,)
                                  // var ele = '_.'+ele;
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