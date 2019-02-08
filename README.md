# Indo-Compiler For Click.js


HTML:--

```html
   <ul id='main'>
      <li class='my-list'>
            <h1>{a.name} -  {a.id}</h1> 
            <ul>
                <li>
                 <b>{c.id}  {c.type}</b>  
                </li>
            </ul>
        </li>
    </ul> 
```
   
   
##AST:-

```bash
{
   "type":"root",
   "children":[
      {
         "type":"ul",
         "props":{
            "id":"main",
            "class":"mainList"
         },
         "children":[
            {
               "type":"li",
               "props":{
                  "class":"my-list"
               },
               "children":[
                  {
                     "type":"h1",
                     "props":{

                     },
                     "children":[
                        "{a.name} -  {a.id}"
                     ]
                  },
                  {
                     "type":"ul",
                     "props":{

                     },
                     "children":[
                        {
                           "type":"li",
                           "props":{

                           },
                           "children":[
                              {
                                 "type":"b",
                                 "props":{

                                 },
                                 "children":[
                                    "{c.id}  {c.type}"
                                 ]
                              }
                           ]
                        }
                     ]
                  }
               ]
            }
         ]
      }
   ]
}
```

#Type of Render Function I am trying to get :-

```
m(
  "ul",
  { id: "main" },
    m(
    "li",
    { class: "my-list" },
    render("h1", null, a.name, " -  ", a.id),
      m(
      "ul",
      {},
        m(
        "li",
        {},
        m("b", null, c.id, "a ", c.type,"sss")
      )
    )
  )
);
``` 

#My output:-

```
m("ul",
   {"id": "main", "class": "mainList"},
   m("li", 
     {"class": "my-list"}, 
     m("h1",
      {},
      {a.name},
      "-", 
      {a.id}),
           m("ul",
             {},
              m("li",
               {},
               m("b", {} , {c.id}, "a ",{c.type}, "sss")
              )
           )
       )
    )
```
#c-loop directive (c-loop='data>>c'):-

```
 m("ul",
   {"id": "main", "class": "mainList"},
   m("li", 
     {"class": "my-list"}, 
     m("h1",
      {},
      {a.name},
      "-", 
      {a.id}),
           m("ul",
             {},
             data.forEach(function(c){
                   return m("li",
                            {},
                            m("b", {} , {c.id}, "a ",{c.type}, "sss")
                           )
             })
           )
       )
    )
 
```

Now I am working to maintain scope for example:-
adding (_. ie. name to _.name ) in fromt of global state and avoiding (_. ie. a.name to a.name if it is loop state ) in front of loop scope 
